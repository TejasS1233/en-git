import { Challenge } from "../models/challenge.model.js";
import { fetchUser, fetchUserRepos, fetchUserEvents, fetchUserCommits } from "./github.service.js";

/**
 * Get current value for any challenge type
 */
export async function getCurrentChallengeValue(type, githubUsername, repoName, userToken) {
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

/**
 * Update progress for a single challenge
 */
export async function updateChallengeProgress(challenge, userToken) {
  try {
    const currentValue = await getCurrentChallengeValue(
      challenge.type,
      challenge.githubUsername,
      challenge.repoName,
      userToken
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

    return challenge;
  } catch (error) {
    console.error(`Failed to update challenge ${challenge._id}:`, error.message);
    throw error;
  }
}

/**
 * Update all active challenges (can be run as a cron job)
 */
export async function updateAllActiveChallenges() {
  try {
    const activeChallenges = await Challenge.find({ status: "active" }).populate("userId");

    console.log(`Updating ${activeChallenges.length} active challenges...`);

    const results = {
      updated: 0,
      completed: 0,
      expired: 0,
      failed: 0,
    };

    for (const challenge of activeChallenges) {
      try {
        const userToken = challenge.userId?.githubAccessToken;
        await updateChallengeProgress(challenge, userToken);

        results.updated++;
        if (challenge.status === "completed") results.completed++;
        if (challenge.status === "expired") results.expired++;
      } catch (error) {
        console.error(`Failed to update challenge ${challenge._id}:`, error.message);
        results.failed++;
      }
    }

    console.log("Challenge update results:", results);
    return results;
  } catch (error) {
    console.error("Failed to update active challenges:", error);
    throw error;
  }
}

/**
 * Check and expire old challenges
 */
export async function expireOldChallenges() {
  try {
    const now = new Date();
    const expiredChallenges = await Challenge.updateMany(
      {
        status: "active",
        deadline: { $lt: now },
      },
      {
        $set: { status: "expired" },
      }
    );

    console.log(`Expired ${expiredChallenges.modifiedCount} challenges`);
    return expiredChallenges.modifiedCount;
  } catch (error) {
    console.error("Failed to expire old challenges:", error);
    throw error;
  }
}
