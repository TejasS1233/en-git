import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Leaderboard from "../models/leaderboard.model.js";

// Update or create leaderboard entry
export const updateLeaderboardEntry = async (username, insights) => {
  try {
    const totalStars =
      insights.topStarred?.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) || 0;

    // Extract languages from insights
    const languages = insights.languages?.percentages?.map((lang) => lang[0]).filter(Boolean) || [];

    // Extract topics from repository topics
    const topics = [];
    if (insights.topicsFrequency) {
      Object.keys(insights.topicsFrequency)
        .slice(0, 10) // Top 10 topics
        .forEach((topic) => topics.push(topic));
    }

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
      languages,
      topics,
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

// Get leaderboard by language
export const getLanguageLeaderboard = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Case-insensitive search
  const languageRegex = new RegExp(`^${language}$`, "i");

  const [entries, total] = await Promise.all([
    Leaderboard.find({
      $or: [{ languages: languageRegex }, { topLanguage: languageRegex }],
    })
      .sort({ score: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Leaderboard.countDocuments({
      $or: [{ languages: languageRegex }, { topLanguage: languageRegex }],
    }),
  ]);

  const rankedEntries = entries.map((entry, index) => ({
    ...entry,
    rank: skip + index + 1,
  }));

  return res.status(200).json(
    new ApiResponse(200, `${language} leaderboard fetched successfully`, {
      language,
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

// Get leaderboard by topic
export const getTopicLeaderboard = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const topicRegex = new RegExp(`^${topic}$`, "i");

  const [entries, total] = await Promise.all([
    Leaderboard.find({ topics: topicRegex })
      .sort({ score: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Leaderboard.countDocuments({ topics: topicRegex }),
  ]);

  const rankedEntries = entries.map((entry, index) => ({
    ...entry,
    rank: skip + index + 1,
  }));

  return res.status(200).json(
    new ApiResponse(200, `${topic} leaderboard fetched successfully`, {
      topic,
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

// Get available languages and topics
export const getAvailableFilters = asyncHandler(async (req, res) => {
  const [languages, topics] = await Promise.all([
    Leaderboard.aggregate([
      { $unwind: "$languages" },
      { $group: { _id: "$languages", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
      { $project: { language: "$_id", count: 1, _id: 0 } },
    ]),
    Leaderboard.aggregate([
      { $unwind: "$topics" },
      { $group: { _id: "$topics", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
      { $project: { topic: "$_id", count: 1, _id: 0 } },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Available filters fetched successfully", {
      languages: languages.filter((l) => l.language), // Remove null/undefined
      topics: topics.filter((t) => t.topic),
    })
  );
});

// Get user's rank in specific language/topic
export const getUserNicheRank = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { language, topic } = req.query;

  const user = await Leaderboard.findOne({ username }).lean();

  if (!user) {
    throw new ApiError(404, "User not found in leaderboard");
  }

  let query = { score: { $gt: user.score } };
  let totalQuery = {};
  let nicheType = "global";

  if (language) {
    const languageRegex = new RegExp(`^${language}$`, "i");
    query.$or = [{ languages: languageRegex }, { topLanguage: languageRegex }];
    totalQuery.$or = [{ languages: languageRegex }, { topLanguage: languageRegex }];
    nicheType = `language: ${language}`;
  } else if (topic) {
    const topicRegex = new RegExp(`^${topic}$`, "i");
    query.topics = topicRegex;
    totalQuery.topics = topicRegex;
    nicheType = `topic: ${topic}`;
  }

  const [rank, total] = await Promise.all([
    Leaderboard.countDocuments(query),
    Leaderboard.countDocuments(totalQuery),
  ]);

  const userRank = rank + 1;
  const percentile = total > 0 ? ((userRank / total) * 100).toFixed(1) : 0;

  return res.status(200).json(
    new ApiResponse(200, "User niche rank fetched successfully", {
      ...user,
      rank: userRank,
      total,
      percentile,
      nicheType,
    })
  );
});
