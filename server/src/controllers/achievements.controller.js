import { asyncHandler } from "../utils/asyncHandler.js";
import Leaderboard from "../models/leaderboard.model.js";
import { getOrGenerateWidgetCache } from "../utils/widgetCacheHelper.js";
import { calculateAchievements } from "../utils/achievements.js";

// Get user achievements
export const getUserAchievements = asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Get user data from leaderboard
  const userData = await Leaderboard.findOne({ username }).lean();

  if (!userData) {
    return res.status(404).json({
      success: false,
      message: "User not found in leaderboard",
    });
  }

  // Calculate rank
  const rank = (await Leaderboard.countDocuments({ score: { $gt: userData.score } })) + 1;
  userData.rank = rank;

  // Get insights data
  const insights = await getOrGenerateWidgetCache(username);

  // Calculate achievements
  const achievements = calculateAchievements(userData, insights);

  res.status(200).json({
    success: true,
    data: achievements,
  });
});
