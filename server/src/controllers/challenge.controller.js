import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Challenge } from "../models/challenge.model.js";
import { StatsSnapshot } from "../models/statsSnapshot.model.js";
import { StatsHistory } from "../models/statsHistory.model.js";

// Create a new challenge
export const createChallenge = asyncHandler(async (req, res) => {
  const { title, type, target, endDate, metadata, reminders } = req.body;
  const userId = req.user._id;

  if (!title || !type || !target) {
    throw new ApiError(400, "Title, type, and target are required");
  }

  const challenge = await Challenge.create({
    user: userId,
    title,
    type,
    target,
    endDate,
    metadata: metadata || {},
    reminders: reminders || { enabled: false },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, challenge, "Challenge created successfully"));
});

// Get user's challenges
export const getUserChallenges = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status } = req.query;

  const query = { user: userId };
  if (status) {
    query.status = status;
  }

  const challenges = await Challenge.find(query).sort({ createdAt: -1 });

  return res.json(
    new ApiResponse(200, challenges, "Challenges retrieved successfully")
  );
});

// Get single challenge
export const getChallenge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const challenge = await Challenge.findOne({ _id: id, user: userId });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  return res.json(new ApiResponse(200, challenge, "Challenge retrieved successfully"));
});

// Update challenge
export const updateChallenge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updates = req.body;

  const challenge = await Challenge.findOne({ _id: id, user: userId });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  Object.assign(challenge, updates);
  await challenge.save();

  return res.json(new ApiResponse(200, challenge, "Challenge updated successfully"));
});

// Delete challenge
export const deleteChallenge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const challenge = await Challenge.findOneAndDelete({ _id: id, user: userId });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  return res.json(new ApiResponse(200, null, "Challenge deleted successfully"));
});

// Track challenge progress
export const trackProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const challenge = await Challenge.findOne({ _id: id, user: userId });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  // Get latest snapshot or history based on challenge type
  const latestSnapshot = await StatsSnapshot.findOne({ username: req.user.username })
    .sort({ snapshotDate: -1 })
    .limit(1);

  const statsHistory = await StatsHistory.find({ username: req.user.username })
    .sort({ recordedAt: -1 })
    .limit(100);

  let currentProgress = 0;

  switch (challenge.type) {
    case "commit_streak":
      // Calculate current streak from stats history
      currentProgress = calculateStreak(statsHistory, "commits");
      break;

    case "learn_language":
      // Check if language appears in latest snapshot
      if (latestSnapshot) {
        const languages = latestSnapshot.languages?.percentages || [];
        currentProgress = languages.some(
          ([lang]) => lang.toLowerCase() === challenge.metadata.language?.toLowerCase()
        )
          ? 1
          : 0;
      }
      break;

    case "reach_stars":
      currentProgress = latestSnapshot?.totalStars || 0;
      break;

    case "contribute_repos":
      currentProgress = statsHistory.filter((s) => s.metricType === "repos").length;
      break;

    case "daily_commits":
      // Count commits in last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      currentProgress = statsHistory.filter(
        (s) => s.metricType === "commits" && s.recordedAt >= oneDayAgo
      ).length;
      break;
  }

  // Update challenge
  challenge.current = currentProgress;
  challenge.progress = Math.min(100, (currentProgress / challenge.target) * 100);

  // Check if completed or failed
  if (challenge.progress >= 100 && challenge.status === "active") {
    challenge.status = "completed";
  }

  await challenge.save();

  return res.json(
    new ApiResponse(200, challenge, "Progress tracked successfully")
  );
});

// Helper function to calculate streak
function calculateStreak(statsHistory, metricType) {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < statsHistory.length; i++) {
    const record = statsHistory[i];
    if (record.metricType === metricType) {
      const recordDate = new Date(record.recordedAt);
      recordDate.setHours(0, 0, 0, 0);

      const dayDiff = (today - recordDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
  }

  return streak;
}

