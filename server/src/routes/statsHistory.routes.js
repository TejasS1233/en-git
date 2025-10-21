import { Router } from "express";
import {
  createSnapshot,
  getStatsHistory,
  getComparison,
  getTrends,
  getProgressReport,
} from "../controllers/statsHistory.controller.js";

const router = Router();

router.post("/snapshot/:username", createSnapshot);
router.get("/history/:username", getStatsHistory);
router.get("/compare/:username", getComparison);
router.get("/trends/:username", getTrends);
router.get("/report/:username", getProgressReport);

export default router;
