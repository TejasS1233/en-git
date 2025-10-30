import axiosInstance from "./axios";

/**
 * Record a profile analysis activity
 * @param {string} userId - User ID (or guest identifier)
 * @param {string} username - Username
 * @param {string} analyzedProfile - GitHub username that was analyzed
 */
export async function recordActivity(userId, username, analyzedProfile) {
  try {
    const response = await axiosInstance.post("/streak/record", {
      userId,
      username,
      analyzedProfile,
    });
    return response.data;
  } catch (error) {
    console.error("Error recording activity:", error);
    throw error;
  }
}

/**
 * Get user's current streak status
 * @param {string} userId - User ID
 * @param {string} username - Username (alternative to userId)
 */
export async function getStreakStatus(userId, username) {
  try {
    const params = {};
    if (userId) params.userId = userId;
    if (username) params.username = username;

    const response = await axiosInstance.get("/streak/status", { params });
    return response.data;
  } catch (error) {
    console.error("Error getting streak status:", error);
    return {
      data: {
        currentStreak: 0,
        longestStreak: 0,
        totalAnalyses: 0,
        hasActivityToday: false,
        isActive: false,
      },
    };
  }
}

/**
 * Get user's activity history
 * @param {string} userId - User ID
 * @param {string} username - Username (alternative to userId)
 * @param {number} limit - Number of records to fetch
 */
export async function getActivityHistory(userId, username, limit = 30) {
  try {
    const params = { limit };
    if (userId) params.userId = userId;
    if (username) params.username = username;

    const response = await axiosInstance.get("/streak/history", { params });
    return response.data;
  } catch (error) {
    console.error("Error getting activity history:", error);
    throw error;
  }
}

/**
 * Get streak leaderboard
 * @param {string} type - Type of leaderboard (current or longest)
 * @param {number} limit - Number of records to fetch
 */
export async function getStreakLeaderboard(type = "current", limit = 50) {
  try {
    const response = await axiosInstance.get("/streak/leaderboard", {
      params: { type, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting streak leaderboard:", error);
    throw error;
  }
}

/**
 * Get detailed streak statistics
 * @param {string} userId - User ID
 * @param {string} username - Username (alternative to userId)
 */
export async function getStreakStats(userId, username) {
  try {
    const params = {};
    if (userId) params.userId = userId;
    if (username) params.username = username;

    const response = await axiosInstance.get("/streak/stats", { params });
    return response.data;
  } catch (error) {
    console.error("Error getting streak stats:", error);
    throw error;
  }
}

/**
 * Get streak status from localStorage (for guest users)
 */
export function getLocalStreakStatus() {
  try {
    const stored = localStorage.getItem("activityStreak");
    if (!stored) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalAnalyses: 0,
        lastActivityDate: null,
        activityDates: [],
      };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error getting local streak status:", error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalAnalyses: 0,
      lastActivityDate: null,
      activityDates: [],
    };
  }
}

/**
 * Update local streak status (for guest users)
 */
export function updateLocalStreak() {
  const streak = getLocalStreakStatus();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already analyzed today
  const lastActivity = streak.lastActivityDate
    ? new Date(streak.lastActivityDate)
    : null;

  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
    if (today.getTime() === lastActivity.getTime()) {
      // Already analyzed today
      return streak;
    }
  }

  // Check if streak is broken
  if (lastActivity) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) {
      // Streak broken
      streak.currentStreak = 1;
    } else {
      // Continue streak
      streak.currentStreak += 1;
    }
  } else {
    // First activity
    streak.currentStreak = 1;
  }

  // Update longest streak
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  // Update dates
  streak.lastActivityDate = today.toISOString();
  streak.totalAnalyses += 1;

  if (!streak.activityDates) {
    streak.activityDates = [];
  }

  // Add today if not already present
  if (
    !streak.activityDates.some((date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    })
  ) {
    streak.activityDates.push(today.toISOString());
  }

  // Save to localStorage
  localStorage.setItem("activityStreak", JSON.stringify(streak));

  return streak;
}

/**
 * Check if user has activity today
 */
export function hasActivityToday() {
  const streak = getLocalStreakStatus();
  if (!streak.lastActivityDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = new Date(streak.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  return today.getTime() === lastActivity.getTime();
}

/**
 * Get streak fire emoji based on streak count
 */
export function getStreakEmoji(streakCount) {
  if (streakCount === 0) return "🔥";
  if (streakCount < 7) return "🔥";
  if (streakCount < 30) return "🔥🔥";
  if (streakCount < 100) return "🔥🔥🔥";
  return "🔥🔥🔥🔥";
}

/**
 * Get streak level based on streak count
 */
export function getStreakLevel(streakCount) {
  if (streakCount === 0) return { level: "New", color: "gray" };
  if (streakCount < 7) return { level: "Beginner", color: "blue" };
  if (streakCount < 30) return { level: "Consistent", color: "green" };
  if (streakCount < 100) return { level: "Dedicated", color: "purple" };
  if (streakCount < 365) return { level: "Master", color: "orange" };
  return { level: "Legend", color: "red" };
}
