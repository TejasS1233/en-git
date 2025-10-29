import { Router } from "express";
import {
  getGlobalLeaderboard,
  getUserRank,
  getLeaderboardStats,
} from "../controllers/leaderboard.controller.js";

const router = Router();

router.route("/").get(getGlobalLeaderboard);
router.route("/stats").get(getLeaderboardStats);
router.route("/rank/:username").get(getUserRank);

export default router;
