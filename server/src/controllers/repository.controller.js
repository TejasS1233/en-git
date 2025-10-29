import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GITHUB_API = "https://api.github.com";
const headers = process.env.GITHUB_TOKEN
  ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  : {};

// Get repository details and analytics
export const getRepositoryInsights = asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;

  if (!owner || !repo) {
    throw new ApiError(400, "Owner and repository name are required");
  }

  try {
    // Fetch repository data
    const [repoData, languages, contributors, commits, issues, pullRequests] = await Promise.all([
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, { headers }),
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, { headers }),
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=10`, { headers }),
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=100`, { headers }),
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}/issues?state=all&per_page=100`, { headers }),
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}/pulls?state=all&per_page=100`, { headers }),
    ]);

    const repository = repoData.data;

    // Process languages
    const totalBytes = Object.values(languages.data).reduce((sum, bytes) => sum + bytes, 0);
    const languageBreakdown = Object.entries(languages.data)
      .map(([lang, bytes]) => ({
        language: lang,
        bytes,
        percentage: ((bytes / totalBytes) * 100).toFixed(2),
      }))
      .sort((a, b) => b.bytes - a.bytes);

    // Analyze commits
    const commitAnalysis = analyzeCommits(commits.data);

    // Analyze contributors
    const contributorStats = contributors.data.map((c) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      contributions: c.contributions,
      percentage: ((c.contributions / commits.data.length) * 100).toFixed(2),
    }));

    // Analyze issues
    const issueStats = analyzeIssues(issues.data);

    // Analyze pull requests
    const prStats = analyzePullRequests(pullRequests.data);

    // Calculate health score
    const healthScore = calculateHealthScore(
      repository,
      commits.data,
      issues.data,
      pullRequests.data
    );

    // Get commit frequency (weekly)
    const commitFrequency = getCommitFrequency(commits.data);

    return res.status(200).json(
      new ApiResponse(200, "Repository insights fetched successfully", {
        repository: {
          name: repository.name,
          full_name: repository.full_name,
          description: repository.description,
          owner: {
            login: repository.owner.login,
            avatar_url: repository.owner.avatar_url,
          },
          html_url: repository.html_url,
          homepage: repository.homepage,
          created_at: repository.created_at,
          updated_at: repository.updated_at,
          pushed_at: repository.pushed_at,
          size: repository.size,
          stargazers_count: repository.stargazers_count,
          watchers_count: repository.watchers_count,
          forks_count: repository.forks_count,
          open_issues_count: repository.open_issues_count,
          default_branch: repository.default_branch,
          topics: repository.topics,
          license: repository.license,
          has_issues: repository.has_issues,
          has_projects: repository.has_projects,
          has_wiki: repository.has_wiki,
          has_pages: repository.has_pages,
          has_downloads: repository.has_downloads,
        },
        languages: languageBreakdown,
        commits: commitAnalysis,
        contributors: contributorStats,
        issues: issueStats,
        pullRequests: prStats,
        healthScore,
        commitFrequency,
      })
    );
  } catch (error) {
    console.error("Repository Insights Error:", error);
    if (error.response?.status === 404) {
      throw new ApiError(404, `Repository '${owner}/${repo}' not found`);
    }
    if (error.response?.status === 403) {
      throw new ApiError(
        403,
        "GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to your .env file."
      );
    }
    throw new ApiError(500, error.message || "Failed to fetch repository insights");
  }
});

// Helper functions
function analyzeCommits(commits) {
  const commitMessages = commits.map((c) => c.commit.message);
  const authors = {};
  const hourDistribution = Array(24).fill(0);
  const dayDistribution = Array(7).fill(0);

  commits.forEach((commit) => {
    const author = commit.commit.author.name;
    authors[author] = (authors[author] || 0) + 1;

    const date = new Date(commit.commit.author.date);
    hourDistribution[date.getHours()]++;
    dayDistribution[date.getDay()]++;
  });

  // Conventional commit analysis
  const conventionalCommits = commitMessages.filter((msg) =>
    /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(\(.+\))?:/.test(msg)
  );

  // Average commit message length
  const avgMessageLength =
    commitMessages.reduce((sum, msg) => sum + msg.split("\n")[0].length, 0) / commitMessages.length;

  return {
    total: commits.length,
    authors: Object.entries(authors)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    conventionalCommitPercentage: (
      (conventionalCommits.length / commitMessages.length) *
      100
    ).toFixed(2),
    avgMessageLength: avgMessageLength.toFixed(0),
    hourDistribution,
    dayDistribution,
    recentCommits: commits.slice(0, 10).map((c) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split("\n")[0],
      author: c.commit.author.name,
      date: c.commit.author.date,
    })),
  };
}

function analyzeIssues(issues) {
  const openIssues = issues.filter((i) => i.state === "open" && !i.pull_request);
  const closedIssues = issues.filter((i) => i.state === "closed" && !i.pull_request);
  const actualIssues = issues.filter((i) => !i.pull_request);

  // Calculate average time to close
  const closedTimes = closedIssues
    .filter((i) => i.closed_at)
    .map((i) => new Date(i.closed_at) - new Date(i.created_at));
  const avgTimeToClose =
    closedTimes.length > 0
      ? closedTimes.reduce((sum, time) => sum + time, 0) / closedTimes.length
      : 0;

  return {
    total: actualIssues.length,
    open: openIssues.length,
    closed: closedIssues.length,
    closeRate:
      actualIssues.length > 0 ? ((closedIssues.length / actualIssues.length) * 100).toFixed(2) : 0,
    avgTimeToCloseDays: (avgTimeToClose / (1000 * 60 * 60 * 24)).toFixed(1),
  };
}

function analyzePullRequests(prs) {
  const openPRs = prs.filter((pr) => pr.state === "open");
  const closedPRs = prs.filter((pr) => pr.state === "closed");
  const mergedPRs = prs.filter((pr) => pr.merged_at);

  // Calculate average time to merge
  const mergeTimes = mergedPRs.map((pr) => new Date(pr.merged_at) - new Date(pr.created_at));
  const avgTimeToMerge =
    mergeTimes.length > 0 ? mergeTimes.reduce((sum, time) => sum + time, 0) / mergeTimes.length : 0;

  return {
    total: prs.length,
    open: openPRs.length,
    closed: closedPRs.length,
    merged: mergedPRs.length,
    mergeRate: prs.length > 0 ? ((mergedPRs.length / prs.length) * 100).toFixed(2) : 0,
    avgTimeToMergeDays: (avgTimeToMerge / (1000 * 60 * 60 * 24)).toFixed(1),
  };
}

function calculateHealthScore(repo, commits, issues, prs) {
  let score = 0;
  const factors = [];

  // README (10 points)
  if (repo.description) {
    score += 10;
    factors.push({ factor: "Has description", points: 10 });
  }

  // License (10 points)
  if (repo.license) {
    score += 10;
    factors.push({ factor: "Has license", points: 10 });
  }

  // Recent activity (20 points)
  const daysSinceUpdate = (Date.now() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 7) {
    score += 20;
    factors.push({ factor: "Updated in last week", points: 20 });
  } else if (daysSinceUpdate < 30) {
    score += 15;
    factors.push({ factor: "Updated in last month", points: 15 });
  } else if (daysSinceUpdate < 90) {
    score += 10;
    factors.push({ factor: "Updated in last 3 months", points: 10 });
  }

  // Has topics (10 points)
  if (repo.topics && repo.topics.length > 0) {
    score += 10;
    factors.push({ factor: `Has ${repo.topics.length} topics`, points: 10 });
  }

  // Issue management (20 points)
  const actualIssues = issues.filter((i) => !i.pull_request);
  if (actualIssues.length > 0) {
    const closedIssues = actualIssues.filter((i) => i.state === "closed");
    const closeRate = closedIssues.length / actualIssues.length;
    const issuePoints = Math.round(closeRate * 20);
    score += issuePoints;
    factors.push({
      factor: `${(closeRate * 100).toFixed(0)}% issue close rate`,
      points: issuePoints,
    });
  }

  // PR management (20 points)
  if (prs.length > 0) {
    const mergedPRs = prs.filter((pr) => pr.merged_at);
    const mergeRate = mergedPRs.length / prs.length;
    const prPoints = Math.round(mergeRate * 20);
    score += prPoints;
    factors.push({ factor: `${(mergeRate * 100).toFixed(0)}% PR merge rate`, points: prPoints });
  }

  // Commit regularity (10 points)
  if (commits.length >= 50) {
    score += 10;
    factors.push({ factor: "Regular commit activity (50+)", points: 10 });
  } else if (commits.length >= 20) {
    score += 5;
    factors.push({ factor: "Moderate commit activity (20+)", points: 5 });
  }

  return {
    score,
    maxScore: 100,
    percentage: score,
    grade: score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : score >= 20 ? "D" : "F",
    factors,
  };
}

function getCommitFrequency(commits) {
  const weeks = {};

  commits.forEach((commit) => {
    const date = new Date(commit.commit.author.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString().split("T")[0];

    weeks[weekKey] = (weeks[weekKey] || 0) + 1;
  });

  return Object.entries(weeks)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => new Date(a.week) - new Date(b.week))
    .slice(-12); // Last 12 weeks
}

// Generate compelling project description using Gemini
export const generateRepoDescription = asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;
  const { repoData } = req.body;

  if (!owner || !repo) {
    throw new ApiError(400, "Owner and repository name are required");
  }

  if (!process.env.GOOGLE_API_KEY) {
    throw new ApiError(500, "Google API key not configured");
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Build context from repository data
    const context = `
Repository: ${repoData.repository.full_name}
Current Description: ${repoData.repository.description || "No description"}
Stars: ${repoData.repository.stargazers_count}
Forks: ${repoData.repository.forks_count}
Primary Language: ${repoData.languages[0]?.language || "Unknown"}
Topics: ${repoData.repository.topics?.join(", ") || "None"}
Health Score: ${repoData.healthScore.score}/100 (${repoData.healthScore.grade})
Total Commits: ${repoData.commits.total}
Contributors: ${repoData.contributors.length}
Open Issues: ${repoData.issues.open}
License: ${repoData.repository.license?.name || "None"}
Last Updated: ${repoData.repository.pushed_at}
    `.trim();

    const prompt = `You are a technical writer creating compelling GitHub repository descriptions.

Based on this repository data:
${context}

Generate a SHORT, IMPACTFUL project description (2-3 sentences max, ~100-150 characters) that:
- Clearly states what the project does
- Highlights its key value proposition
- Uses active, engaging language
- Avoids generic phrases like "this project" or "this repository"
- Sounds professional and exciting

Return ONLY the description text, nothing else. No quotes, no explanations.`;

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();

    return res.status(200).json(
      new ApiResponse(200, "Description generated successfully", {
        description,
      })
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new ApiError(500, error.message || "Failed to generate description");
  }
});
