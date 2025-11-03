import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer", "").trim();

    if (!token) {
      throw new ApiError("Access token is missing or invalid", 401);
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError("User not found for the provided access token", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle JWT expiration specifically
    if (error.name === "TokenExpiredError") {
      // Clear the expired cookie
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      throw new ApiError("Session expired. Please login again.", 401);
    }
    throw new ApiError(error.message || "Access token is invalid or expired", 401);
  }
});

// Optional JWT verification - doesn't throw error if no token
export const optionalJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer", "").trim();

    console.log("🔐 optionalJWT Debug:");
    console.log("  - Has cookie token:", !!req.cookies?.accessToken);
    console.log("  - Has auth header:", !!req.headers["authorization"]);
    console.log("  - Token found:", !!token);

    if (token) {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken +githubAccessToken"
      );

      if (user) {
        console.log("  - User found:", user.githubUsername || user.email);
        console.log("  - Has GitHub token:", !!user.githubAccessToken);
        req.user = user;
      } else {
        console.log("  - User not found in database");
      }
    } else {
      console.log("  - No token provided (anonymous request)");
    }
  } catch (error) {
    // Silently fail - this is optional auth
    console.log("  - Optional JWT verification failed:", error.message);
  }
  next();
});
