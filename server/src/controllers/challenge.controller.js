import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Challenge } from "../models/challenge.model.js";
import {
  fetchUser,
  fetchUserRepos,
  fetchUserEvents,
  fetchUserCommits,
} from "../services/github.service.js";
import { checkChallengeAchievements } from "../utils/challengeAchievements.js";

// Helper function to get current value for any challenge type
async function getCurrentValue(type, githubUsername, repoName, userToken) {
  const [user] = await fetchUser(githubUsername);
  const [repos] = await fetchUserRepos(githubUsername, 100, false, userToken);
  const [events] = await fetchUserEvents(githubUsername);

  switch (type) {
    case "followers":
      return user.followers || 0;

    case "stars":
      return repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    case "repo_stars": {
      const repo = repos.find((r) => r.name === repoName || r.full_name.endsWith(`/${repoName}`));
      return repo?.stargazers_count || 0;
    }

    case "forks": {
      const repo = repos.find((r) => r.name === repoName || r.full_name.endsWith(`/${repoName}`));
      return repo?.forks_count || 0;
    }

    case "watchers": {
      const repo = repos.find((r) => r.name === repoName || r.full_name.endsWith(`/${repoName}`));
      return repo?.watchers_count || 0;
    }

    case "repos_created":
      return repos.length;

    case "commits": {
      const commits = await fetchUserCommits(githubUsername, repos);
      return commits.length;
    }

    case "pull_requests": {
      const prEvents = events.filter((e) => e.type === "PullRequestEvent");
      return prEvents.length;
    }

    case "issues_closed": {
      const issueEvents = events.filter(
        (e) => e.type === "IssuesEvent" && e.payload?.action === "closed"
      );
      return issueEvents.length;
    }

    case "contributions": {
      // Count unique days with contributions
      const contributionDays = new Set();
      events.forEach((event) => {
        const date = new Date(event.created_at).toDateString();
        contributionDays.add(date);
      });
      return contributionDays.size;
    }

    case "streak_days": {
      // Calculate current streak from events
      const dates = events
        .map((e) => new Date(e.created_at).toDateString())
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => new Date(b) - new Date(a));

      let streak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (dates[0] === today || dates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diffDays = Math.floor((prevDate - currDate) / 86400000);
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
      return streak;
    }

    case "languages_used": {
      const languages = new Set();
      repos.forEach((repo) => {
        if (repo.language) {
          languages.add(repo.language);
        }
      });
      return languages.size;
    }

    default:
      return 0;
  }
}

// Create a new challenge
export const createChallenge = asyncHandler(async (req, res) => {
  const { type, targetValue, repoName, deadline, title, description, difficulty, rewards } =
    req.body;

  if (!type || !targetValue || !deadline || !title) {
    throw new ApiError(400, "Type, target value, deadline, and title are required");
  }

  const validTypes = [
    "followers",
    "stars",
    "repo_stars",
    "commits",
    "pull_requests",
    "issues_closed",
    "contributions",
    "streak_days",
    "repos_created",
    "forks",
    "watchers",
    "languages_used",
  ];

  if (!validTypes.includes(type)) {
    throw new ApiError(400, "Invalid challenge type");
  }

  const repoRequiredTypes = ["repo_stars", "forks", "watchers"];
  if (repoRequiredTypes.includes(type) && !repoName) {
    throw new ApiError(400, `Repository name is required for ${type} challenge`);
  }

  const githubUsername = req.user.githubUsername;
  if (!githubUsername) {
    throw new ApiError(400, "GitHub account not connected");
  }

  // Get current value from GitHub
  let currentValue = 0;
  try {
    currentValue = await getCurrentValue(
      type,
      githubUsername,
      repoName,
      req.user.githubAccessToken
    );
  } catch (error) {
    console.error("Failed to fetch current GitHub stats:", error);
    throw new ApiError(500, "Failed to fetch current GitHub stats");
  }

  if (targetValue <= currentValue) {
    throw new ApiError(400, "Target value must be greater than current value");
  }

  // Create milestones (25%, 50%, 75%, 100%)
  const total = targetValue - currentValue;
  const milestones = [0.25, 0.5, 0.75, 1].map((percent) => ({
    value: Math.round(currentValue + total * percent),
    reached: false,
  }));

  const challenge = await Challenge.create({
    userId: req.user._id,
    githubUsername,
    type,
    targetValue,
    currentValue,
    startValue: currentValue,
    repoName,
    deadline: new Date(deadline),
    title,
    description,
    milestones,
    difficulty: difficulty || "medium",
    rewards: rewards || { xp: 0 },
  });

  return res.status(201).json(new ApiResponse(201, "Challenge created successfully", challenge));
});

// Get all challenges for authenticated user
export const getUserChallenges = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { userId: req.user._id };

  if (status) {
    query.status = status;
  }

  const challenges = await Challenge.find(query).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, "Challenges fetched successfully", challenges));
});

// Get a specific challenge
export const getChallenge = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const challenge = await Challenge.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  return res.status(200).json(new ApiResponse(200, "Challenge fetched successfully", challenge));
});

// Update challenge progress
export const updateChallengeProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const challenge = await Challenge.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  if (challenge.status !== "active") {
    throw new ApiError(400, "Cannot update inactive challenge");
  }

  // Fetch current value from GitHub
  let currentValue = 0;
  try {
    currentValue = await getCurrentValue(
      challenge.type,
      challenge.githubUsername,
      challenge.repoName,
      req.user.githubAccessToken
    );
  } catch (error) {
    console.error("Failed to fetch current GitHub stats:", error);
    throw new ApiError(500, "Failed to fetch current GitHub stats");
  }

  challenge.currentValue = currentValue;

  // Update milestones
  challenge.milestones.forEach((milestone) => {
    if (!milestone.reached && currentValue >= milestone.value) {
      milestone.reached = true;
      milestone.reachedAt = new Date();
    }
  });

  // Update status
  const previousStatus = challenge.status;
  challenge.updateStatus();
  await challenge.save();

  // Check for new achievements if challenge was just completed
  let achievementData = null;
  if (previousStatus === "active" && challenge.status === "completed") {
    try {
      achievementData = await checkChallengeAchievements(req.user._id);
    } catch (error) {
      console.error("Failed to check achievements:", error);
    }
  }

  return res.status(200).json(
    new ApiResponse(200, "Challenge progress updated", {
      challenge,
      newAchievements: achievementData?.newAchievements || [],
    })
  );
});

// Delete a challenge
export const deleteChallenge = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const challenge = await Challenge.findOneAndDelete({
    _id: id,
    userId: req.user._id,
  });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  return res.status(200).json(new ApiResponse(200, "Challenge deleted successfully", null));
});

// Get challenge statistics
export const getChallengeStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await Challenge.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const statsMap = {
    active: 0,
    completed: 0,
    failed: 0,
    expired: 0,
  };

  stats.forEach((stat) => {
    statsMap[stat._id] = stat.count;
  });

  const total = Object.values(statsMap).reduce((sum, count) => sum + count, 0);
  const successRate = total > 0 ? Math.round((statsMap.completed / total) * 100) : 0;

  // Calculate total XP earned
  const completedChallenges = await Challenge.find({
    userId,
    status: "completed",
  }).select("rewards");

  const totalXP = completedChallenges.reduce((sum, challenge) => {
    return sum + (challenge.rewards?.xp || 0);
  }, 0);

  return res.status(200).json(
    new ApiResponse(200, "Challenge stats fetched successfully", {
      ...statsMap,
      total,
      successRate,
      totalXP,
    })
  );
});

// Get AI-powered challenge suggestions
export const getAISuggestions = asyncHandler(async (req, res) => {
  const { githubUsername } = req.body;

  if (!githubUsername) {
    throw new ApiError(400, "GitHub username is required");
  }

  try {
    // Fetch user's GitHub data
    const [user] = await fetchUser(githubUsername);
    const [repos] = await fetchUserRepos(githubUsername, 100, false, req.user.githubAccessToken);
    const [events] = await fetchUserEvents(githubUsername);

    // Calculate current stats
    const currentStats = {
      followers: user.followers || 0,
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      publicRepos: repos.length,
      totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      recentCommits: events.filter((e) => e.type === "PushEvent").length,
      languages: [...new Set(repos.map((r) => r.language).filter(Boolean))].length,
    };

    // Get existing challenges to avoid duplicates
    const existingChallenges = await Challenge.find({
      userId: req.user._id,
      status: "active",
    });

    const existingTypes = new Set(existingChallenges.map((c) => c.type));

    // Generate smart suggestions based on current stats
    const suggestions = [];

    // Followers challenge
    if (!existingTypes.has("followers") && currentStats.followers < 1000) {
      const target = Math.ceil(currentStats.followers * 1.5) || 10;
      suggestions.push({
        type: "followers",
        title: `Reach ${target} Followers`,
        description: `Grow your GitHub community by gaining ${target - currentStats.followers} more followers`,
        targetValue: target,
        difficulty: target < 50 ? "easy" : target < 200 ? "medium" : "hard",
        xp: target < 50 ? 100 : target < 200 ? 250 : 500,
        duration: "30 days",
        category: "growth",
      });
    }

    // Stars challenge
    if (!existingTypes.has("stars") && currentStats.totalStars < 500) {
      const target = Math.ceil(currentStats.totalStars * 1.3) || 25;
      suggestions.push({
        type: "stars",
        title: `Collect ${target} Total Stars`,
        description: `Increase your total repository stars to ${target}`,
        targetValue: target,
        difficulty: target < 100 ? "easy" : target < 300 ? "medium" : "hard",
        xp: target < 100 ? 100 : target < 300 ? 250 : 500,
        duration: "60 days",
        category: "growth",
      });
    }

    // Commits challenge
    if (!existingTypes.has("commits")) {
      const target = 50;
      suggestions.push({
        type: "commits",
        title: "Make 50 Commits",
        description: "Stay active and make 50 commits across your repositories",
        targetValue: target,
        difficulty: "easy",
        xp: 100,
        duration: "30 days",
        category: "activity",
      });
    }

    // Repo stars challenge (for most popular repo)
    if (repos.length > 0 && !existingTypes.has("repo_stars")) {
      const topRepo = repos.sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
      const currentStars = topRepo.stargazers_count;
      const target = Math.ceil(currentStars * 1.5) || 10;

      suggestions.push({
        type: "repo_stars",
        title: `Get ${target} Stars on ${topRepo.name}`,
        description: `Grow your most popular repository to ${target} stars`,
        targetValue: target,
        repoName: topRepo.name,
        difficulty: target < 50 ? "easy" : target < 200 ? "medium" : "hard",
        xp: target < 50 ? 100 : target < 200 ? 250 : 500,
        duration: "45 days",
        category: "growth",
      });
    }

    // Contribution streak challenge
    if (!existingTypes.has("streak_days")) {
      suggestions.push({
        type: "streak_days",
        title: "Build a 30-Day Streak",
        description: "Contribute to GitHub every day for 30 consecutive days",
        targetValue: 30,
        difficulty: "hard",
        xp: 500,
        duration: "30 days",
        category: "streak",
      });
    }

    // Languages challenge
    if (!existingTypes.has("languages_used") && currentStats.languages < 10) {
      const target = Math.min(currentStats.languages + 3, 10);
      suggestions.push({
        type: "languages_used",
        title: `Code in ${target} Languages`,
        description: "Expand your skills by coding in multiple programming languages",
        targetValue: target,
        difficulty: target >= 10 ? "legendary" : "medium",
        xp: target >= 10 ? 1000 : 250,
        duration: "90 days",
        category: "streak",
      });
    }

    // Return top 3 suggestions
    const topSuggestions = suggestions.slice(0, 3);

    return res.status(200).json(new ApiResponse(200, "AI suggestions generated", topSuggestions));
  } catch (error) {
    console.error("Failed to generate AI suggestions:", error);
    throw new ApiError(500, "Failed to generate challenge suggestions");
  }
});

// Update all user's active challenges
export const updateAllUserChallenges = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const activeChallenges = await Challenge.find({
    userId,
    status: "active",
  });

  const results = {
    updated: 0,
    completed: 0,
    failed: 0,
  };

  for (const challenge of activeChallenges) {
    try {
      let currentValue = await getCurrentValue(
        challenge.type,
        challenge.githubUsername,
        challenge.repoName,
        req.user.githubAccessToken
      );

      challenge.currentValue = currentValue;

      // Update milestones
      challenge.milestones.forEach((milestone) => {
        if (!milestone.reached && currentValue >= milestone.value) {
          milestone.reached = true;
          milestone.reachedAt = new Date();
        }
      });

      // Update status
      challenge.updateStatus();
      await challenge.save();

      results.updated++;
      if (challenge.status === "completed") results.completed++;
    } catch (error) {
      console.error(`Failed to update challenge ${challenge._id}:`, error);
      results.failed++;
    }
  }

  return res.status(200).json(new ApiResponse(200, "All challenges updated successfully", results));
});
