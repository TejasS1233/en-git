import { Router } from "express";
import { getRepositoryInsights, getRepositoryBranches } from "../controllers/repository.controller.js";

const router = Router();

router.route("/:owner/:repo").get(getRepositoryInsights);
router.route("/:owner/:repo/branches").get(getRepositoryBranches);

export default router;
