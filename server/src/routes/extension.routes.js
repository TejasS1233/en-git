import { Router } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Get API key for Chrome extension (rate limited)
router.get(
  "/api-key",
  asyncHandler(async (req, res) => {
    // Only provide API key if coming from extension
    const userAgent = req.headers["user-agent"] || "";
    const isExtension =
      userAgent.includes("Chrome") && req.headers["sec-fetch-site"] === "cross-site";

    if (!isExtension && process.env.NODE_ENV === "production") {
      return res.status(403).json(new ApiResponse(403, null, "Access denied"));
    }

    // Return API key (should be read-only, rate-limited key)
    const apiKey = process.env.GOOGLE_API_KEY_EXTENSION || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(503).json(new ApiResponse(503, null, "AI service not configured"));
    }

    return res.status(200).json(new ApiResponse(200, { apiKey }, "API key retrieved"));
  })
);

export default router;
