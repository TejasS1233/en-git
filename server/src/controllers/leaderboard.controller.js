import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Leaderboard from "../models/leaderboard.model.js";

// Update or create leaderboard entry
export const updateLeaderboardEntry = async (username, insights) => {
  try {
    const totalStars =
      insights.topStarred?.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) || 0;

    const entry = {
      username: insights.user.login,
      name: insights.user.name || insights.user.login,
      avatar: insights.user.avatar_url,
      score: insights.profileScore?.score || 0,
      grade: insights.profileScore?.grade || "F",
      location: insights.user.location || null,
      bio: insights.user.bio || null,
      publicRepos: insights.user.public_repos || 0,
      followers: insights.user.followers || 0,
      totalStars,
      topLanguage: insights.languages?.top3?.[0]?.[0] || null,
      profileUrl: insights.user.html_url,
    };

    await Leaderboard.findOneAndUpdate({ username: entry.username }, entry, {
      upsert: true,
      new: true,
    });

    console.log(`Leaderboard updated for ${username}`);
  } catch (error) {
    console.error("Failed to update leaderboard:", error);
    throw error;
  }
};

// Get global leaderboard
export const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    Leaderboard.find().sort({ score: -1, updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Leaderboard.countDocuments(),
  ]);

  // Add rank to each entry
  const rankedEntries = entries.map((entry, index) => ({
    ...entry,
    rank: skip + index + 1,
  }));

  return res.status(200).json(
    new ApiResponse(200, "Leaderboard fetched successfully", {
      entries: rankedEntries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        hasMore: page * limit < total,
      },
    })
  );
});

// Get user rank
export const getUserRank = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await Leaderboard.findOne({ username }).lean();

  if (!user) {
    throw new ApiError(404, "User not found in leaderboard");
  }

  // Calculate rank by counting users with higher scores
  const rank = (await Leaderboard.countDocuments({ score: { $gt: user.score } })) + 1;
  const total = await Leaderboard.countDocuments();

  // Percentile: what percentage of users you're better than
  // Rank 1 of 100 = top 1% (better than 99%)
  // Rank 18 of 18 = bottom (better than 0%)
  const percentile = parseFloat(((rank / total) * 100).toFixed(1));

  return res.status(200).json(
    new ApiResponse(200, "User rank fetched successfully", {
      ...user,
      rank,
      total,
      percentile: percentile.toFixed(1),
    })
  );
});

// Get leaderboard stats
export const getLeaderboardStats = asyncHandler(async (req, res) => {
  const [total, avgScore, topScore] = await Promise.all([
    Leaderboard.countDocuments(),
    Leaderboard.aggregate([{ $group: { _id: null, avg: { $avg: "$score" } } }]),
    Leaderboard.findOne().sort({ score: -1 }).lean(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Leaderboard stats fetched successfully", {
      totalUsers: total,
      averageScore: avgScore[0]?.avg?.toFixed(1) || 0,
      topScore: topScore?.score || 0,
      topUser: topScore?.username || null,
    })
  );
});
