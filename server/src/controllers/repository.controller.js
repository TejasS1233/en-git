import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GITHUB_API = "https://api.github.com";

// Get repository details and analytics
export const getRepositoryInsights = asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;

  if (!owner || !repo) {
    throw new ApiError(400, "Owner and repository name are required");
  }

  try {
    // Try user token first if logged in (works for owned repos and collaborator repos)
    // Fall back to server token if user not logged in
    const token = req.user?.githubAccessToken || process.env.GITHUB_TOKEN;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log("🔍 Repository Insights Debug:");
    console.log("  - Owner:", owner);
    console.log("  - Repo:", repo);
    console.log("  - Logged in user:", req.user?.githubUsername || "none");
    console.log("  - Using user token:", !!req.user?.githubAccessToken);
    console.log("  - Token preview:", token ? `${token.substring(0, 10)}...` : "none");

    // Fetch repository data
    const [repoData, languages, contributorsResponse, commits, issues, pullRequests, licenseData] =
      await Promise.all([
        axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, { headers }),
        axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, { headers }),
        axios.get(`${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=100&anon=true`, {
          headers,
        }),
        axios.get(`${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=100`, { headers }),
        axios.get(`${GITHUB_API}/repos/${owner}/${repo}/issues?state=all&per_page=100`, {
          headers,
        }),
        axios.get(`${GITHUB_API}/repos/${owner}/${repo}/pulls?state=all&per_page=100`, { headers }),
        // Try to fetch license content
        axios.get(`${GITHUB_API}/repos/${owner}/${repo}/license`, { headers }).catch(() => null),
      ]);

    const contributors = contributorsResponse;
    const repository = repoData.data;

    console.log(`\n📄 License Check for ${owner}/${repo}:`);
    console.log("  - Repo license key:", repository.license?.key);
    console.log("  - Repo license name:", repository.license?.name);
    console.log("  - License API response exists:", !!licenseData);
    console.log("  - License API has data:", !!licenseData?.data);
    console.log("  - License API has content:", !!licenseData?.data?.content);

    // Enhance license info if we got license content
    if (licenseData?.data?.license) {
      repository.detectedLicense = licenseData.data.license;
    }

    // If license is "Other", try to detect actual license from content
    if (repository.license?.key === "other" && licenseData?.data?.content) {
      try {
        const licenseContent = Buffer.from(licenseData.data.content, "base64")
          .toString("utf-8")
          .toLowerCase();

        // Detect common licenses from content
        if (
          licenseContent.includes("gnu general public license") ||
          licenseContent.includes("gpl")
        ) {
          if (licenseContent.includes("version 3")) {
            repository.actualLicense = "GNU GPL v3.0";
          } else if (licenseContent.includes("version 2")) {
            repository.actualLicense = "GNU GPL v2.0";
          } else {
            repository.actualLicense = "GNU GPL";
          }
        } else if (licenseContent.includes("mit license")) {
          repository.actualLicense = "MIT";
        } else if (licenseContent.includes("apache license")) {
          repository.actualLicense = "Apache 2.0";
        } else if (licenseContent.includes("bsd")) {
          repository.actualLicense = "BSD";
        } else if (licenseContent.includes("mozilla public license")) {
          repository.actualLicense = "MPL 2.0";
        }

        console.log(`✅ Detected actual license for ${owner}/${repo}:`, repository.actualLicense);
      } catch (err) {
        console.error("Error parsing license content:", err);
      }
    }

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
    const totalContributors = contributors.data.length;
    const totalContributions = contributors.data.reduce((sum, c) => sum + c.contributions, 0);

    console.log(`\n👥 Contributor Stats for ${owner}/${repo}:`);
    console.log(`  - Total contributors: ${totalContributors}`);
    console.log(`  - Total contributions: ${totalContributions}`);
    console.log(
      `  - Top contributor: ${contributors.data[0]?.login} with ${contributors.data[0]?.contributions} contributions`
    );
    console.log(
      `  - Top contributor %: ${((contributors.data[0]?.contributions / totalContributions) * 100).toFixed(2)}%`
    );

    const contributorStats = contributors.data.slice(0, 10).map((c) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      contributions: c.contributions,
      percentage: ((c.contributions / totalContributions) * 100).toFixed(2),
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
          language: repository.language,
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
        totalContributors,
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

// Generate AI comparison summary for multiple repositories
export const generateRepoComparison = asyncHandler(async (req, res) => {
  console.log("\n🤖 ===== AI COMPARISON REQUEST =====");
  console.log("Request body exists:", !!req.body);
  console.log("Request body type:", typeof req.body);

  const { repositories } = req.body || {};

  console.log("  - Repositories exists:", !!repositories);
  console.log("  - Repositories is array:", Array.isArray(repositories));
  console.log("  - Repository count:", repositories?.length);

  if (repositories && Array.isArray(repositories)) {
    console.log(
      "  - Repository names:",
      repositories.map((r) => r?.full_name || r?.name || "UNKNOWN")
    );
    if (repositories.length > 0 && repositories[0]) {
      console.log("  - Sample repo keys:", Object.keys(repositories[0]));
    }
  }

  if (!repositories || !Array.isArray(repositories) || repositories.length < 2) {
    console.error("❌ Invalid repositories data");
    throw new ApiError(400, "At least 2 repositories are required for comparison");
  }

  if (!process.env.GOOGLE_API_KEY) {
    throw new ApiError(500, "Google API key not configured");
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Build detailed context for each repository
    const repoContexts = repositories
      .map((repo, idx) => {
        try {
          const num = idx + 1;
          const name = repo.full_name || repo.name || `Unknown Repository ${num}`;
          const stars = Number(repo.stargazers_count) || 0;
          const forks = Number(repo.forks_count) || 0;
          const watchers = Number(repo.watchers_count) || 0;

          // Build health score breakdown
          const healthFactors =
            repo.healthScore?.factors
              ?.map((f) => `  • ${f.factor}: +${f.points} points`)
              .join("\n") || "  • No factors available";

          return `
Repository ${num}: ${name}
- Description: ${repo.description || "No description"}
- Stars: ${stars.toLocaleString()}
- Forks: ${forks.toLocaleString()}
- Watchers: ${watchers.toLocaleString()}
- Open Issues: ${repo.open_issues_count || 0}
- Primary Language: ${repo.languages?.[0]?.language || repo.language || "Unknown"}
- Total Commits: ${repo.commits?.total || 0}
- Total Contributors: ${repo.totalContributors || repo.contributors?.length || 0}
- Top Contributors: ${
            repo.contributors
              ?.slice(0, 3)
              .map((c) => `${c.login} (${c.contributions} commits, ${c.percentage}%)`)
              .join(", ") || "N/A"
          }
- Contributor Concentration: Top contributor has ${repo.contributors?.[0]?.percentage || 0}% of commits (${
            parseFloat(repo.contributors?.[0]?.percentage || 0) > 70
              ? "⚠️ HIGH bus factor risk"
              : parseFloat(repo.contributors?.[0]?.percentage || 0) > 50
                ? "⚠️ MODERATE bus factor risk"
                : "✅ Good distribution"
          })
- Issue Management:
  • Total Issues: ${repo.issues?.total || 0}
  • Open: ${repo.issues?.open || 0}
  • Closed: ${repo.issues?.closed || 0}
  • Close Rate: ${repo.issues?.closeRate || 0}%
  • Avg Time to Close: ${repo.issues?.avgTimeToCloseDays || 0} days
- Pull Request Management:
  • Total PRs: ${repo.pullRequests?.total || 0}
  • Open: ${repo.pullRequests?.open || 0}
  • Merged: ${repo.pullRequests?.merged || 0}
  • Merge Rate: ${repo.pullRequests?.mergeRate || 0}%
  • Avg Time to Merge: ${repo.pullRequests?.avgTimeToMergeDays || 0} days
- Health Score: ${repo.healthScore?.score || 0}/100 (Grade: ${repo.healthScore?.grade || "N/A"})
  Health Score Breakdown:
${healthFactors}
- Last Updated: ${repo.pushed_at ? new Date(repo.pushed_at).toLocaleDateString() : "Unknown"}
- Created: ${repo.created_at ? new Date(repo.created_at).toLocaleDateString() : "Unknown"}
- License: ${
            repo.actualLicense
              ? `✅ ${repo.actualLicense}`
              : repo.license?.key === "other"
                ? "✅ HAS LICENSE FILE (type not auto-detected by GitHub)"
                : repo.license?.name
                  ? `✅ ${repo.license.name}`
                  : "❌ NO LICENSE FILE"
          }
- Topics: ${repo.topics?.join(", ") || "None"}
          `.trim();
        } catch (err) {
          console.error(`Error building context for repo ${idx + 1}:`, err);
          return `Repository ${idx + 1}: Error processing repository data`;
        }
      })
      .join("\n\n");

    console.log("📊 Repository contexts built successfully");

    const prompt = `You are a battle-hardened CTO with 15+ years evaluating open-source projects for Fortune 500 companies. Your job is to cut through the BS and reveal insights that numbers alone don't show.

REPOSITORIES TO ANALYZE:
${repoContexts}

YOUR MISSION:
Provide a BRUTALLY HONEST, insight-driven comparison that reveals hidden patterns, red flags, and non-obvious truths. Don't just repeat the numbers—interpret what they MEAN for real-world usage.

ANALYSIS STRUCTURE:

## 🎯 The Verdict (2-3 sentences)
Cut to the chase. Which repo wins and why? What's the ONE insight that matters most? Be decisive and controversial if needed.

## 🔥 What The Numbers DON'T Tell You
This is where you earn your salary. Reveal insights like:
- **Maintenance Velocity**: Are commits recent or is this a zombie project? Look at commit patterns and last update dates.
- **Community Momentum**: High stars but low forks? That's tourists, not builders. Analyze the fork-to-star ratio.
- **Issue Hell**: Low close rates + high open issues = maintainer burnout. Calculate the "issue debt" (open issues / contributors).
- **PR Graveyard**: Low merge rates mean either strict standards (good) or abandoned PRs (bad). Look at avg time to merge.
- **Contributor Concentration**: Are 2-3 people doing 80% of commits? That's a bus factor problem. Check top contributors.
- **Health Score Reality Check**: Don't just compare scores. ANALYZE THE FACTORS. Which repo is missing critical factors? What does each factor reveal about project quality?
- **Time Metrics**: Avg time to close issues and merge PRs reveals maintainer responsiveness. Fast = active, slow = overwhelmed.

## 💀 Red Flags & Warning Signs
Call out concerning patterns:
- Stale maintenance (last update > 1 month ago)
- Issue accumulation (open issues growing faster than closes)
- Low PR merge rates (< 40% = community frustration)
- Contributor burnout signals (declining commit frequency)
- Missing critical health factors (no license, no docs, no topics)

## 🚀 Hidden Strengths
Identify non-obvious advantages:
- Exceptional issue management (close rate > 60%)
- Strong contributor diversity (no single-person dependency)
- Consistent commit patterns (regular activity, not sporadic bursts)
- High-quality PR process (merge rate 50-70% = good standards)
- Strong documentation signals (topics, description, license)

## 🎲 The Real-World Decision
Answer these questions directly:
- **For a new startup**: Which repo has less risk of abandonment?
- **For enterprise**: Which has better long-term support signals?
- **For contributors**: Which community is more welcoming (PR merge rate)?
- **For stability**: Which has fewer breaking changes (issue patterns)?

## 💣 Controversial Take
Give ONE spicy, opinionated insight that challenges conventional wisdom. Examples:
- "React's massive star count is actually a liability—too many casual users means noisier issues"
- "Angular's lower stars hide a more professional, enterprise-focused community"
- "The 5-point health score difference is meaningless—both have the same critical gaps"

WRITING RULES:
- Use specific numbers and ratios, not vague terms
- Calculate meaningful metrics (fork/star ratio, issue debt, contributor concentration)
- Identify PATTERNS, not just data points
- Be opinionated and decisive
- Use analogies and metaphors
- Call out BS (e.g., "vanity metrics", "zombie projects", "tourist stars")
- Write like you're advising a friend, not a corporate memo
- 400-500 words max
- Use markdown formatting with emojis

FORBIDDEN PHRASES:
- "Both are good options"
- "It depends on your needs"
- "Strong community support"
- "Active development"
- Any generic corporate speak

OUTPUT FORMAT:
Return your analysis as markdown text, but START with a special line:
WINNER: owner/repo-name

For example:
WINNER: facebook/react
or
WINNER: TIE

Use the EXACT repository name format (owner/repo). This winner declaration will be used to influence the final comparison score with a 20% weight bonus.

🚨 CRITICAL LICENSE ANALYSIS RULES:

1. **"None" or null license** = TRULY MISSING = Red flag
2. **"Other" license** = LICENSE EXISTS but GitHub can't auto-detect it
   - This is COMMON for GPL, custom licenses, or non-standard formatting
   - DO NOT say "no license" or "missing license" for "Other"
   - Say: "Has a license file (detected as 'Other' by GitHub)"
   - This is NOT a dealbreaker, just means manual verification needed

3. **"Unrecognized by GitHub"** in the license field = LICENSE FILE EXISTS
   - The repo HAS a LICENSE file
   - It's just not in GitHub's standard template format
   - Treat this as HAVING a license, not missing one

4. **Only call out "None" as a critical issue**, not "Other" or "Unrecognized"

REMEMBER: Most repos with "Other" license actually have GPL, MIT, Apache, or similar. Don't penalize them for GitHub's detection limitations.

Generate your analysis now:`;

    console.log("📝 Sending prompt to Gemini AI...");
    const result = await model.generateContent(prompt);
    const analysis = result.response.text().trim();
    console.log("✅ AI analysis generated successfully");

    return res.status(200).json(
      new ApiResponse(200, "Comparison analysis generated successfully", {
        analysis,
        repositoryCount: repositories.length,
        generatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("❌ AI Comparison Error:");
    console.error("  - Message:", error.message);
    console.error("  - Stack:", error.stack);
    console.error("  - Full error:", JSON.stringify(error, null, 2));

    // Return a more helpful error response
    const errorMessage = error.message || "Failed to generate comparison analysis";
    const errorDetails = error.response?.data || error.toString();

    throw new ApiError(
      500,
      `AI Analysis Error: ${errorMessage}. Details: ${JSON.stringify(errorDetails)}`
    );
  }
});

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
