import { Router } from "express";
import {
  getRepositoryInsights,
  generateRepoDescription,
} from "../controllers/repository.controller.js";

const router = Router();

router.route("/:owner/:repo").get(getRepositoryInsights);
router.route("/:owner/:repo/generate-description").post(generateRepoDescription);

export default router;
