import { asyncHandler } from "../utils/asyncHandler.js";
import Leaderboard from "../models/leaderboard.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

/**
 * Get averaged stats of top 10 leaderboard users
 * This is cached and rate-limit safe
 */
export const getTop10Average = asyncHandler(async (req, res) => {
  try {
    // Get top 10 users from leaderboard
    const top10 = await Leaderboard.find().sort({ score: -1 }).limit(10).lean();

    if (top10.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, "No leaderboard data available", {
          average: null,
          top10Count: 0,
        })
      );
    }

    // Calculate averages
    const averages = {
      score: Math.round(top10.reduce((sum, u) => sum + (u.score || 0), 0) / top10.length),
      publicRepos: Math.round(
        top10.reduce((sum, u) => sum + (u.publicRepos || 0), 0) / top10.length
      ),
      totalStars: Math.round(top10.reduce((sum, u) => sum + (u.totalStars || 0), 0) / top10.length),
      followers: Math.round(top10.reduce((sum, u) => sum + (u.followers || 0), 0) / top10.length),
    };

    // Get grade distribution
    const grades = top10.map((u) => u.grade).filter(Boolean);
    const gradeCount = {};
    grades.forEach((g) => {
      gradeCount[g] = (gradeCount[g] || 0) + 1;
    });
    const mostCommonGrade = Object.entries(gradeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "A";

    // Get top languages
    const languages = top10.map((u) => u.topLanguage).filter(Boolean);
    const langCount = {};
    languages.forEach((l) => {
      langCount[l] = (langCount[l] || 0) + 1;
    });
    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    return res.status(200).json(
      new ApiResponse(200, "Top 10 average stats fetched successfully", {
        average: {
          ...averages,
          grade: mostCommonGrade,
          topLanguages,
        },
        top10Users: top10.map((u) => ({
          username: u.username,
          name: u.name,
          score: u.score,
          grade: u.grade,
          rank: top10.indexOf(u) + 1,
        })),
        top10Count: top10.length,
        calculatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error fetching top 10 average:", error);
    return res.status(500).json(new ApiResponse(500, "Failed to fetch top 10 average", null));
  }
});
