import { Router } from "express";
import {
  getRepositoryInsights,
  generateRepoDescription,
  generateRepoComparison,
} from "../controllers/repository.controller.js";
import { optionalJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Specific routes must come before parameterized routes
router.route("/compare/ai-analysis").post(generateRepoComparison);
router.route("/:owner/:repo").get(optionalJWT, getRepositoryInsights);
router.route("/:owner/:repo/generate-description").post(optionalJWT, generateRepoDescription);

export default router;
