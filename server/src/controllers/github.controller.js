import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  fetchUser,
  fetchUserRepos,
  fetchRepoLanguages,
  fetchUserEvents,
  fetchTrending,
} from "../services/github.service.js";
import {
  aggregateLanguages,
  mostActive,
  mostStarred,
  topicsFrequency,
  commitTimeDistribution,
  weeklyActivity,
} from "../utils/githubAnalytics.js";
import pLimit from "p-limit";
import { inferDomain } from "../utils/skillDomain.js";
import { generateCareerInsights, generateLearningPath } from "../services/ai.service.js";
import { getGithubInsights as getInsightsService } from "../services/ai.service.js";

export const getUserInsights = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(400, "username is required");
  }

  try {
    const user = await fetchUser(username);
    const repos = await fetchUserRepos(username);

    // fetch languages per repo (limit concurrency)
    const limit = pLimit(5);
    const langEntries = await Promise.all(
      repos.map((r) =>
        limit(() =>
          fetchRepoLanguages(r.owner.login, r.name)
            .then((l) => [r, l])
            .catch(() => [r, {}])
        )
      )
    );
    const repoLanguages = new Map(langEntries.map(([r, l]) => [`${r.owner.login}/${r.name}`, l]));

    const events = await fetchUserEvents(username).catch(() => []);

    const languagesAgg = aggregateLanguages(repos, repoLanguages);
    const topics = topicsFrequency(repos);
    const commitTimes = commitTimeDistribution(events);
    const weekly = weeklyActivity(events);
    const topStarred = mostStarred(repos, 3);
    const topActive = mostActive(repos, 3);

    const domain = inferDomain(languagesAgg.percentages, topics.slice(0, 10));

    return res.status(200).json(
      new ApiResponse(200, "Insights fetched successfully", {
        user,
        reposCount: repos.length,
        languages: languagesAgg,
        topics: topics.slice(0, 20),
        topStarred,
        topActive,
        commitTimes,
        weekly,
        domain,
      })
    );
  } catch (error) {
    if (error.response?.status === 403) {
      throw new ApiError(
        403,
        "GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to your .env file or try again later."
      );
    }
    if (error.response?.status === 404) {
      throw new ApiError(404, `GitHub user '${username}' not found`);
    }
    throw new ApiError(500, error.message || "Failed to fetch GitHub insights");
  }
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(400, "username is required");
  }

  try {
    const user = await fetchUser(username);
    const repos = await fetchUserRepos(username);
    const topics = topicsFrequency(repos)
      .slice(0, 10)
      .map(([t]) => t);

    // choose top language for trending
    const limit = pLimit(4);
    const trending = await Promise.all([
      limit(() => fetchTrending("", "daily").catch(() => [])),
      limit(() => fetchTrending("javascript", "daily").catch(() => [])),
      limit(() => fetchTrending("python", "daily").catch(() => [])),
      limit(() => fetchTrending("typescript", "daily").catch(() => [])),
    ]);
    const flat = trending.flat();

    const matched = flat.filter((item) => {
      const lower =
        (item.description || "").toLowerCase() + " " + (item.language || "").toLowerCase();
      return topics.some((t) => lower.includes(t.toLowerCase()));
    });

    const personalIdeas = topics.map((t) => ({
      title: `Build a ${t} starter or tool`,
      description: `Create a project exploring ${t} that showcases your expertise.`,
      tag: t,
    }));

    return res.status(200).json(
      new ApiResponse(200, "Recommendations fetched successfully", {
        user: { login: user.login, avatar_url: user.avatar_url },
        trendingMatches: matched.slice(0, 10),
        personalIdeas: personalIdeas.slice(0, 10),
        trendingSample: flat.slice(0, 10),
      })
    );
  } catch (error) {
    if (error.response?.status === 403) {
      throw new ApiError(
        403,
        "GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to your .env file or try again later."
      );
    }
    if (error.response?.status === 404) {
      throw new ApiError(404, `GitHub user '${username}' not found`);
    }
    throw new ApiError(500, error.message || "Failed to fetch recommendations");
  }
});

export const getAIInsights = asyncHandler(async (req, res) => {
  const { username } = req.params;

  try {
    // First, get the user's insights
    const user = await fetchUser(username);
    const repos = await fetchUserRepos(username);

    if (!repos || repos.length === 0) {
      throw new ApiError(404, "No repositories found for this user");
    }

    const limit = pLimit(5);
    const langEntries = await Promise.all(
      repos.slice(0, 50).map((r) =>
        limit(() =>
          fetchRepoLanguages(r.owner.login, r.name)
            .then((l) => [r, l])
            .catch(() => [r, {}])
        )
      )
    );
    const repoLanguages = new Map(langEntries.map(([r, l]) => [`${r.owner.login}/${r.name}`, l]));

    const events = await fetchUserEvents(username);
    const commits = events
      .filter((e) => e.type === "PushEvent")
      .flatMap((e) => e.payload?.commits || []);

    const languages = aggregateLanguages(repos, repoLanguages);
    const topics = topicsFrequency(repos);
    const domain = inferDomain(
      languages.percentages,
      topics.map(([t]) => t)
    );

    const insights = {
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      reposCount: user.public_repos,
      languages,
      domain,
      topics,
      topStarred: mostStarred(repos),
      commitTimes: commitTimeDistribution(events),
    };

    // Generate AI insights
    let aiInsights, learningPath;

    try {
      aiInsights = await generateCareerInsights(insights, commits);
      learningPath = await generateLearningPath(
        domain.domain,
        languages.top3.map(([lang]) => lang)
      );
    } catch (aiError) {
      console.error("AI Generation Error:", aiError.message);

      // Fallback insights if AI fails
      aiInsights = {
        summary: `${insights.user.name || insights.user.login} is a ${domain.domain} developer with expertise in ${languages.top3.map(([l]) => l).join(", ")}. With ${insights.reposCount} public repositories, they demonstrate strong technical skills and consistent contribution patterns.`,
        strengths: [
          `Proficient in ${languages.top3[0]?.[0] || "multiple languages"} with ${languages.top3[0]?.[1] || 0}% usage`,
          `Active in ${domain.domain} domain with ${insights.topStarred?.length || 0} starred projects`,
          `Consistent coder with ${insights.commitTimes?.profile || "regular"} activity pattern`,
        ],
        growthAreas: [
          "Explore trending technologies and frameworks",
          "Contribute to open-source projects",
          "Expand skill set to complementary domains",
        ],
        projects: [
          `Build a full-stack application using ${languages.top3[0]?.[0] || "your primary language"}`,
          `Create a portfolio project showcasing ${domain.domain} expertise`,
          "Develop a tool that solves a real-world problem",
        ],
        careerPaths: [`${domain.domain} Engineer`, "Full Stack Developer", "Software Architect"],
        note: "⚠️ AI insights unavailable. Using fallback analysis. Please configure GOOGLE_API_KEY for AI-powered insights.",
      };

      learningPath = {
        phases: [
          {
            months: "Month 1-2: Foundation",
            skills: [
              "Advanced " + (languages.top3[0]?.[0] || "programming"),
              "System Design",
              "Best Practices",
            ],
            project: "Build a personal project using current skills",
          },
          {
            months: "Month 3-4: Expansion",
            skills: ["New Framework", "Testing", "CI/CD"],
            project: "Contribute to open source",
          },
          {
            months: "Month 5-6: Specialization",
            skills: [domain.domain + " Advanced", "Performance", "Security"],
            project: "Create a production-ready application",
          },
        ],
      };
    }

    return res.status(200).json(
      new ApiResponse(200, "AI insights generated successfully", {
        insights: aiInsights,
        learningPath,
        generatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("AI Insights Error:", error);
    if (error.response?.status === 403) {
      throw new ApiError(
        403,
        "GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to your .env file or try again later."
      );
    }
    if (error.response?.status === 404) {
      throw new ApiError(404, `GitHub user '${username}' not found`);
    }
    throw new ApiError(500, error.message || "Failed to generate AI insights");
  }
});

const getGithubInsights = asyncHandler(async (req, res) => {
  const { username } = req.params;
  // Correctly parse the 'refresh' query parameter from the request
  const refresh = req.query.refresh === 'true';

  // Pass the refresh flag to the service layer
  const { insightsData, lastUpdated } = await getInsightsService(username, refresh);

  // The controller's job is to format the final API response
  return res
    .status(200)
    .json(new ApiResponse(200, { data: insightsData, lastUpdated }, "Insights fetched successfully"));
});

export { getGithubInsights };
