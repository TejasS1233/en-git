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
export const optionalJWT = async (req, res, next) => {
  console.log("\n🔐 ===== OPTIONAL JWT MIDDLEWARE =====");
  console.log("📍 Request URL:", req.originalUrl);
  console.log("📍 Request Method:", req.method);

  try {
    const cookieToken = req.cookies?.accessToken;
    const headerToken = req.headers["authorization"]?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    console.log("🍪 Cookie token exists:", !!cookieToken);
    console.log("📨 Header token exists:", !!headerToken);
    console.log("🎫 Final token exists:", !!token);

    if (token) {
      console.log("🔓 Attempting to verify token...");
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log("✅ Token verified! User ID:", decodedToken._id);

      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken +githubAccessToken"
      );

      if (user) {
        console.log("👤 User found in database:");
        console.log("   - ID:", user._id);
        console.log("   - Email:", user.email);
        console.log("   - GitHub Username:", user.githubUsername || "NOT SET");
        console.log("   - GitHub ID:", user.githubId || "NOT SET");
        console.log("   - Has GitHub Access Token:", !!user.githubAccessToken);
        console.log("   - Token length:", user.githubAccessToken?.length || 0);
        req.user = user;
        console.log("✅ req.user SET successfully");
      } else {
        console.log("❌ User NOT found in database for ID:", decodedToken._id);
      }
    } else {
      console.log("ℹ️  No token provided - anonymous request");
    }
  } catch (error) {
    console.log("⚠️  Optional JWT verification failed:", error.message);
    console.log("   Error type:", error.name);
  }

  console.log("🏁 Middleware complete. req.user exists:", !!req.user);
  console.log("===== END OPTIONAL JWT =====\n");
  next();
};
