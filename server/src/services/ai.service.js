import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchUser, fetchUserRepos } from "./github.service.js";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("⚠️  GOOGLE_API_KEY not found in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateCareerInsights(insights, commits = []) {
  if (!apiKey) {
    throw new Error("Google API key not configured. Please add GOOGLE_API_KEY to your .env file.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a career advisor analyzing a software developer's GitHub profile. Based on the following data, provide concise, actionable career insights.

**Profile Data:**
- Username: ${insights.user.login}
- Total Repositories: ${insights.reposCount}
- Top 3 Languages: ${insights.languages?.top3?.map(([lang, pct]) => `${lang} (${pct}%)`).join(", ")}
- Primary Domain: ${insights.domain?.domain}
- Coding Pattern: ${insights.commitTimes?.profile === "night-coder" ? "Night Coder" : "Early Bird"}
- Popular Topics: ${insights.topics
      ?.slice(0, 10)
      .map(([t]) => t)
      .join(", ")}
- Total Stars: ${insights.topStarred?.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)}

${
  commits.length > 0
    ? `**Recent Commit Messages (sample):**\n${commits
        .slice(0, 10)
        .map((c) => `- ${c.commit?.message || ""}`)
        .join("\n")}`
    : ""
}

Provide:
1. **Career Summary** (2-3 sentences about their profile)
2. **Strengths** (3 bullet points)
3. **Growth Areas** (3 specific skills or technologies to learn)
4. **Recommended Projects** (2-3 project ideas to build next)
5. **Career Path** (suggest 2-3 job titles or specializations they'd excel in)

Keep it concise, specific, and actionable. Format as JSON with keys: summary, strengths[], growthAreas[], projects[], careerPaths[].`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse as JSON, fallback to structured text
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch {
      // Fallback: parse as structured text
      return {
        summary:
          text.split("**Career Summary**")[1]?.split("**")[0]?.trim() || text.substring(0, 200),
        strengths: [],
        growthAreas: [],
        projects: [],
        careerPaths: [],
        rawText: text,
      };
    }
  } catch (error) {
    console.error("AI insight generation failed:", error);
    throw error;
  }
}

export async function generateLearningPath(domain, languages) {
  if (!apiKey) {
    throw new Error("Google API key not configured. Please add GOOGLE_API_KEY to your .env file.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a tech education advisor. A ${domain} developer with skills in ${languages.join(", ")} wants to grow their career.

Suggest a 6-month learning roadmap with:
1. **Month 1-2**: Foundation skills to solidify
2. **Month 3-4**: Intermediate skills to add
3. **Month 5-6**: Advanced skills for specialization

For each phase, suggest:
- 2-3 specific technologies/concepts to learn
- 1-2 recommended courses or resources
- 1 project to build

Format as JSON: { phases: [{ months, skills[], resources[], project }] }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch {
      return { phases: [], rawText: text };
    }
  } catch (error) {
    console.error("Learning path generation failed:", error);
    throw error;
  }
}

// In whichever function calls the github service, e.g., getGithubInsights
export const getGithubInsights = async (username, refresh = false) => {
  // Destructure the tuple to get the raw data
  const [user, userLastUpdated] = await fetchUser(username, refresh);
  const [repos, reposLastUpdated] = await fetchUserRepos(username, refresh);

  // Handle case where data fetching failed
  if (!user || !repos) {
    throw new Error(`Could not fetch GitHub data for ${username} to generate AI insights.`);
  }

  // Now use `user` and `repos` variables directly, as they contain the raw data
  const prompt = `Analyze GitHub user ${user.login} who has ${repos.length} repositories...`;
  // ... rest of the function ...

  // You must also return the lastUpdated timestamp for the controller
  const lastUpdated = new Date(userLastUpdated) > new Date(reposLastUpdated) ? userLastUpdated : reposLastUpdated;
  
  // Assuming this function returns an object with insights
  const insightsData = { /*... your generated insights ...*/ };

  return { insightsData, lastUpdated };
};
