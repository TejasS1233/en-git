import { Router } from "express";
import {
  recordActivity,
  getStreakStatus,
  getActivityHistory,
  getStreakLeaderboard,
  resetStreak,
  getStreakStats,
} from "../controllers/activityStreak.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (can be accessed without authentication for guest users)
router.get("/status", getStreakStatus);
router.get("/leaderboard", getStreakLeaderboard);

// Protected routes (require authentication)
router.post("/record", recordActivity);
router.get("/history", getActivityHistory);
router.get("/stats", getStreakStats);
router.post("/reset", verifyJWT, resetStreak);

export default router;
