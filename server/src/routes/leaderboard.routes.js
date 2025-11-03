import { Router } from "express";
import {
  getGlobalLeaderboard,
  getUserRank,
  getLeaderboardStats,
} from "../controllers/leaderboard.controller.js";
import { getTop10Average } from "../controllers/leaderboardStats.controller.js";

const router = Router();

router.route("/").get(getGlobalLeaderboard);
router.route("/stats").get(getLeaderboardStats);
router.route("/top10-average").get(getTop10Average);
router.route("/rank/:username").get(getUserRank);

export default router;
