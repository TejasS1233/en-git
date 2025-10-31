import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ActivityStreak } from "../models/activityStreak.model.js";
import { User } from "../models/user.model.js";

/**
 * Record a profile analysis activity and update streak
 */
export const recordActivity = asyncHandler(async (req, res) => {
  const { userId, username, analyzedProfile } = req.body;

  if (!userId || !username) {
    throw new ApiError(400, "userId and username are required");
  }

  try {
    // Find or create activity streak for user
    let streak = await ActivityStreak.findOne({ userId, username });

    if (!streak) {
      // Create new streak record
      streak = new ActivityStreak({
        userId,
        username,
        currentStreak: 0,
        longestStreak: 0,
        activityDates: [],
        analyzedProfiles: [],
      });
    }

    // Update streak
    const updateResult = streak.updateStreak();

    // Add analyzed profile to history if provided
    if (analyzedProfile) {
      // Limit to last 100 analyzed profiles
      if (streak.analyzedProfiles.length >= 100) {
        streak.analyzedProfiles.shift();
      }
      
      streak.analyzedProfiles.push({
        githubUsername: analyzedProfile,
        analyzedAt: new Date(),
      });
    }

    // Save the updated streak
    await streak.save();

    const status = streak.getStreakStatus();

    return res.status(200).json(
      new ApiResponse(200, "Activity recorded successfully", {
        ...status,
        updateResult,
      })
    );
  } catch (error) {
    console.error("Error recording activity:", error);
    throw new ApiError(500, error.message || "Failed to record activity");
  }
});

/**
 * Get user's current streak status
 */
export const getStreakStatus = asyncHandler(async (req, res) => {
  const { userId, username } = req.query;

  if (!userId && !username) {
    throw new ApiError(400, "userId or username is required");
  }

  try {
    const query = userId ? { userId } : { username };
    let streak = await ActivityStreak.findOne(query);

    if (!streak) {
      // Return default streak status for new users
      return res.status(200).json(
        new ApiResponse(200, "No activity streak found", {
          currentStreak: 0,
          longestStreak: 0,
          totalAnalyses: 0,
          lastActivityDate: null,
          hasActivityToday: false,
          isActive: false,
          daysUntilReset: 0,
        })
      );
    }

    const status = streak.getStreakStatus();

    return res.status(200).json(
      new ApiResponse(200, "Streak status retrieved successfully", status)
    );
  } catch (error) {
    console.error("Error getting streak status:", error);
    throw new ApiError(500, error.message || "Failed to get streak status");
  }
});

/**
 * Get user's activity history
 */
export const getActivityHistory = asyncHandler(async (req, res) => {
  const { userId, username } = req.query;
  const { limit = 30 } = req.query;

  if (!userId && !username) {
    throw new ApiError(400, "userId or username is required");
  }

  try {
    const query = userId ? { userId } : { username };
    const streak = await ActivityStreak.findOne(query);

    if (!streak) {
      return res.status(200).json(
        new ApiResponse(200, "No activity history found", {
          activityDates: [],
          analyzedProfiles: [],
        })
      );
    }

    // Sort activity dates in descending order
    const activityDates = streak.activityDates
      .sort((a, b) => new Date(b) - new Date(a))
      .slice(0, parseInt(limit));

    // Get recent analyzed profiles
    const recentProfiles = streak.analyzedProfiles
      .sort((a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt))
      .slice(0, parseInt(limit));

    return res.status(200).json(
      new ApiResponse(200, "Activity history retrieved successfully", {
        activityDates,
        analyzedProfiles: recentProfiles,
        totalAnalyses: streak.totalAnalyses,
      })
    );
  } catch (error) {
    console.error("Error getting activity history:", error);
    throw new ApiError(500, error.message || "Failed to get activity history");
  }
});

/**
 * Get leaderboard of users with highest streaks
 */
export const getStreakLeaderboard = asyncHandler(async (req, res) => {
  const { type = "current", limit = 50 } = req.query;

  try {
    const sortField = type === "longest" ? "longestStreak" : "currentStreak";

    const leaderboard = await ActivityStreak.find({
      [sortField]: { $gt: 0 },
    })
      .sort({ [sortField]: -1, updatedAt: -1 })
      .limit(parseInt(limit))
      .select("username currentStreak longestStreak totalAnalyses lastActivityDate")
      .lean();

    // Add rank to each entry
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
      isActive: (() => {
        if (!entry.lastActivityDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastActivity = new Date(entry.lastActivityDate);
        lastActivity.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
        return daysDiff <= 1;
      })(),
    }));

    return res.status(200).json(
      new ApiResponse(200, "Streak leaderboard retrieved successfully", {
        leaderboard: rankedLeaderboard,
        type,
      })
    );
  } catch (error) {
    console.error("Error getting streak leaderboard:", error);
    throw new ApiError(500, error.message || "Failed to get streak leaderboard");
  }
});

/**
 * Reset user's streak (admin only or for testing)
 */
export const resetStreak = asyncHandler(async (req, res) => {
  const { userId, username } = req.body;

  if (!userId && !username) {
    throw new ApiError(400, "userId or username is required");
  }

  try {
    const query = userId ? { userId } : { username };
    const streak = await ActivityStreak.findOne(query);

    if (!streak) {
      throw new ApiError(404, "Streak record not found");
    }

    // Reset streak but keep history
    streak.currentStreak = 0;
    streak.lastActivityDate = null;

    await streak.save();

    return res.status(200).json(
      new ApiResponse(200, "Streak reset successfully", {
        currentStreak: 0,
        longestStreak: streak.longestStreak,
        totalAnalyses: streak.totalAnalyses,
      })
    );
  } catch (error) {
    console.error("Error resetting streak:", error);
    throw new ApiError(500, error.message || "Failed to reset streak");
  }
});

/**
 * Get streak statistics for a user
 */
export const getStreakStats = asyncHandler(async (req, res) => {
  const { userId, username } = req.query;

  if (!userId && !username) {
    throw new ApiError(400, "userId or username is required");
  }

  try {
    const query = userId ? { userId } : { username };
    const streak = await ActivityStreak.findOne(query);

    if (!streak) {
      return res.status(200).json(
        new ApiResponse(200, "No streak statistics found", {
          currentStreak: 0,
          longestStreak: 0,
          totalAnalyses: 0,
          avgAnalysesPerDay: 0,
          activeDays: 0,
          lastActivityDate: null,
        })
      );
    }

    // Calculate statistics
    const activeDays = streak.activityDates.length;
    const firstActivity = streak.activityDates.length > 0 
      ? new Date(Math.min(...streak.activityDates.map(d => new Date(d))))
      : null;
    
    const daysSinceFirst = firstActivity
      ? Math.floor((new Date() - firstActivity) / (1000 * 60 * 60 * 24)) + 1
      : 0;

    const avgAnalysesPerDay = daysSinceFirst > 0 
      ? (streak.totalAnalyses / daysSinceFirst).toFixed(2)
      : 0;

    const stats = {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalAnalyses: streak.totalAnalyses,
      activeDays,
      avgAnalysesPerDay: parseFloat(avgAnalysesPerDay),
      lastActivityDate: streak.lastActivityDate,
      firstActivityDate: firstActivity,
      isActive: streak.hasActivityToday() || !streak.isStreakBroken(),
    };

    return res.status(200).json(
      new ApiResponse(200, "Streak statistics retrieved successfully", stats)
    );
  } catch (error) {
    console.error("Error getting streak statistics:", error);
    throw new ApiError(500, error.message || "Failed to get streak statistics");
  }
});
