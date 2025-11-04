import { Router } from "express";
import {
  getGlobalLeaderboard,
  getUserRank,
  getLeaderboardStats,
  getLanguageLeaderboard,
  getTopicLeaderboard,
  getAvailableFilters,
  getUserNicheRank,
} from "../controllers/leaderboard.controller.js";
import { getTop10Average } from "../controllers/leaderboardStats.controller.js";

const router = Router();

router.route("/").get(getGlobalLeaderboard);
router.route("/stats").get(getLeaderboardStats);
router.route("/filters").get(getAvailableFilters);
router.route("/top10-average").get(getTop10Average);
router.route("/language/:language").get(getLanguageLeaderboard);
router.route("/topic/:topic").get(getTopicLeaderboard);
router.route("/rank/:username").get(getUserRank);
router.route("/rank/:username/niche").get(getUserNicheRank);

export default router;
