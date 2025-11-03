import { Router } from "express";
import {
  getRepositoryInsights,
  generateRepoDescription,
} from "../controllers/repository.controller.js";
import { optionalJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:owner/:repo").get(optionalJWT, getRepositoryInsights);
router.route("/:owner/:repo/generate-description").post(optionalJWT, generateRepoDescription);

export default router;
