import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("⚠️  GOOGLE_API_KEY not found in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Platform identifiers for course suggestions
const PLATFORMS = {
  youtube: "YouTube",
  udemy: "Udemy",
  coursera: "Coursera",
  nptel: "NPTEL",
  edx: "edX",
  freecodecamp: "freeCodeCamp",
  pluralsight: "Pluralsight",
};

export async function generateLearningRecommendations(insights, skillGaps) {
  if (!apiKey) {
    throw new Error("Google API key not configured. Please add GOOGLE_API_KEY to your .env file.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an educational advisor helping a ${insights.domain?.domain || "developer"} improve their skills. Based on their GitHub profile analysis, suggest relevant courses and learning resources.

**User Profile:**
- Username: ${insights.user.login}
- Primary Domain: ${insights.domain?.domain || "Generalist"}
- Top Languages: ${insights.languages?.top3?.map(([lang, pct]) => `${lang} (${pct}%)`).join(", ")}
- Popular Topics: ${insights.topics?.slice(0, 10).map(([t]) => t).join(", ")}
- Skill Gaps/Areas to Improve: ${skillGaps.join(", ")}

Suggest 5-7 courses with the following criteria:
1. Mix of free (YouTube, freeCodeCamp) and paid (Udemy, Coursera, Pluralsight) options
2. Courses should address the identified skill gaps
3. Include both beginner-friendly and advanced options
4. Prioritize platforms: YouTube, Udemy, Coursera, NPTEL, edX, freeCodeCamp

For each course, provide:
- Title: Clear, descriptive course name
- Platform: One of [YouTube, Udemy, Coursera, NPTEL, edX, freeCodeCamp, Pluralsight]
- Type: "free" or "paid"
- Category: "beginner", "intermediate", or "advanced"
- Skills: Array of 2-3 skills this course teaches
- Description: Brief 1-sentence description
- Why: Why this course is recommended for this user

Format as JSON array with keys: title, platform, type, category, skills[], description, why.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse as JSON
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return JSON.parse(text);
    } catch {
      // Fallback: Generate basic recommendations without AI
      return generateFallbackRecommendations(insights, skillGaps);
    }
  } catch (error) {
    console.error("Learning recommendations generation failed:", error);
    // Return fallback recommendations
    return generateFallbackRecommendations(insights, skillGaps);
  }
}

function generateFallbackRecommendations(insights, skillGaps) {
  const domain = insights.domain?.domain || "Web Development";
  const topLanguage = insights.languages?.top3?.[0]?.[0] || "JavaScript";
  const isFrontend = domain.includes("Web") || domain.includes("Frontend");
  const isBackend = domain.includes("Backend") || domain.includes("API");

  const recommendations = [];

  // Core language course
  if (topLanguage) {
    recommendations.push({
      title: `Complete ${topLanguage} Mastery Course`,
      platform: "Udemy",
      type: "paid",
      category: "intermediate",
      skills: [topLanguage, "Best Practices", "Advanced Patterns"],
      description: `Comprehensive course covering ${topLanguage} from basics to advanced topics.`,
      why: `Strengthen your ${topLanguage} skills, which you use in ${insights.languages?.top3?.[0]?.[1] || 0}% of your projects.`,
    });
  }

  // Domain-specific courses
  if (isFrontend) {
    recommendations.push(
      {
        title: "Modern JavaScript - The Complete Guide",
        platform: "Udemy",
        type: "paid",
        category: "intermediate",
        skills: ["JavaScript", "ES6+", "Modern Patterns"],
        description: "Learn modern JavaScript features and patterns essential for frontend development.",
        why: "Enhance your frontend development skills with cutting-edge JavaScript techniques.",
      },
      {
        title: "Complete React Developer Course",
        platform: "freeCodeCamp",
        type: "free",
        category: "beginner",
        skills: ["React", "Components", "State Management"],
        description: "Build real-world applications with React and modern development tools.",
        why: "Expand your React knowledge to build more complex applications.",
      }
    );
  }

  if (isBackend) {
    recommendations.push({
      title: "System Design and Architecture",
      platform: "Coursera",
      type: "paid",
      category: "advanced",
      skills: ["System Design", "Scalability", "Architecture"],
      description: "Learn to design scalable and reliable backend systems.",
      why: "Advance your backend skills to build enterprise-level applications.",
    });
  }

  // Platform-specific free resources
  recommendations.push(
    {
      title: `${topLanguage} Crash Course for Beginners`,
      platform: "YouTube",
      type: "free",
      category: "beginner",
      skills: [topLanguage, "Basics", "Fundamentals"],
      description: `Quick introduction to ${topLanguage} programming fundamentals.`,
      why: "Free resource to refresh your basics or learn new concepts quickly.",
    },
    {
      title: "Open Source Contribution Guide",
      platform: "freeCodeCamp",
      type: "free",
      category: "beginner",
      skills: ["Git", "Contributing", "Collaboration"],
      description: "Learn how to contribute to open-source projects effectively.",
      why: "Improve your collaboration skills and build your developer portfolio.",
    }
  );

  // Add skill gap specific recommendations
  if (skillGaps.length > 0) {
    skillGaps.slice(0, 2).forEach((skill) => {
      recommendations.push({
        title: `Learn ${skill}`,
        platform: "YouTube",
        type: "free",
        category: "beginner",
        skills: [skill, "Practical Examples"],
        description: `Free tutorials and guides to master ${skill}.`,
        why: `This course addresses your skill gap in ${skill}.`,
      });
    });
  }

  return recommendations.slice(0, 6);
}

export async function getSkillGaps(insights, languages, topics) {
  if (!apiKey) {
    throw new Error("Google API key not configured.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this developer's profile and identify skill gaps:

**Profile:**
- Primary Domain: ${insights.domain?.domain || "Generalist"}
- Languages Used: ${languages?.map(([l]) => l).join(", ")}
- Topics: ${topics?.join(", ")}

Based on their domain and current skills, suggest 3-5 specific skills or technologies they should learn to advance their career. Consider:
1. Skills missing for their domain
2. Important complementary skills
3. Trending technologies in their field

Return ONLY a JSON array of skill names (strings), e.g., ["Docker", "Redis", "GraphQL"].`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch {
      // Fallback: suggest common skills based on domain
      return generateFallbackSkillGaps(insights);
    }
  } catch (error) {
    console.error("Skill gaps analysis failed:", error);
    return generateFallbackSkillGaps(insights);
  }
}

function generateFallbackSkillGaps(insights) {
  const domain = insights.domain?.domain || "Web Development";
  const topLang = insights.languages?.top3?.[0]?.[0] || "JavaScript";

  const gapMap = {
    "Web Development": ["TypeScript", "Testing", "Performance Optimization"],
    "Backend Development": ["Microservices", "Docker", "System Design"],
    "Mobile Development": ["Flutter", "React Native", "App Store Deployment"],
    "DevOps/Infrastructure": ["Kubernetes", "Terraform", "CI/CD"],
    "Data Science": ["Machine Learning", "Data Visualization", "Big Data"],
    "AI/ML": ["Deep Learning", "TensorFlow", "Model Deployment"],
  };

  const gaps = gapMap[domain] || ["Advanced Architecture", "Best Practices", "Testing"];
  
  // Add a gap if they're not using TypeScript in a JS-heavy profile
  if (topLang === "JavaScript" && !insights.languages?.top3?.some(([l]) => l === "TypeScript")) {
    gaps.unshift("TypeScript");
  }

  return gaps.slice(0, 4);
}
