import { Router } from "express";
import {
  createChallenge,
  getUserChallenges,
  getChallenge,
  updateChallenge,
  deleteChallenge,
  trackProgress,
} from "../controllers/challenge.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Challenge routes
router.post("/", createChallenge);
router.get("/", getUserChallenges);
router.get("/:id", getChallenge);
router.put("/:id", updateChallenge);
router.delete("/:id", deleteChallenge);

// Track progress
router.post("/:id/track", trackProgress);

export default router;

