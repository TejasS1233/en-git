import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  captureSnapshot,
  getHistoricalSnapshots,
  compareSnapshots,
  generateTrendData,
} from "../services/statsSnapshot.service.js";

export const createSnapshot = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  try {
    const snapshot = await captureSnapshot(username);
    return res
      .status(201)
      .json(new ApiResponse(201, "Snapshot created successfully", snapshot));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to create snapshot");
  }
});

export const getStatsHistory = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { startDate, endDate } = req.query;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  try {
    const snapshots = await getHistoricalSnapshots(username, startDate, endDate);
    return res
      .status(200)
      .json(new ApiResponse(200, "Historical stats retrieved successfully", snapshots));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to retrieve stats history");
  }
});

export const getComparison = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { period = "month" } = req.query;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  try {
    const comparison = await compareSnapshots(username, period);

    if (!comparison) {
      throw new ApiError(404, "No snapshots found for this user");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Comparison retrieved successfully", comparison));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to generate comparison");
  }
});

export const getTrends = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { period = "month", metrics } = req.query;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  try {
    const metricTypes = metrics ? metrics.split(",") : undefined;
    const trends = await generateTrendData(username, period, metricTypes);

    return res.status(200).json(new ApiResponse(200, "Trends retrieved successfully", trends));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to generate trends");
  }
});

export const getProgressReport = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { period = "week" } = req.query;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  try {
    const [comparison, trends] = await Promise.all([
      compareSnapshots(username, period),
      generateTrendData(username, period),
    ]);

    if (!comparison || !comparison.current) {
      throw new ApiError(404, "No data available for this user");
    }

    const report = {
      period,
      username,
      current: comparison.current,
      past: comparison.past,
      changes: comparison.changes,
      trends,
      generatedAt: new Date(),
    };

    return res.status(200).json(new ApiResponse(200, "Progress report generated", report));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to generate progress report");
  }
});
