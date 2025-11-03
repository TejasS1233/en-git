import { Router } from "express";
import {
  getUserInsights,
  getRecommendations,
  getAIInsights,
} from "../controllers/github.controller.js";
import { optionalJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Use optional auth to include private repos when user views their own profile
router.get("/insights/:username", optionalJWT, getUserInsights);
router.get("/recommendations/:username", optionalJWT, getRecommendations);
router.get("/ai-insights/:username", optionalJWT, getAIInsights);

export default router;
