import { Router } from "express";
import {
  getUserInsights,
  getRecommendations,
  getAIInsights,
  getLearningRecommendations,
} from "../controllers/github.controller.js";

const router = Router();

router.get("/insights/:username", getUserInsights);
router.get("/recommendations/:username", getRecommendations);
router.get("/ai-insights/:username", getAIInsights);
router.get("/learning-recommendations/:username", getLearningRecommendations);

export default router;
