import { Router } from "express";
import {
  createChallenge,
  getUserChallenges,
  getChallenge,
  updateChallengeProgress,
  deleteChallenge,
  getChallengeStats,
  getAISuggestions,
  updateAllUserChallenges,
} from "../controllers/challenge.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/").post(createChallenge).get(getUserChallenges);
router.route("/stats").get(getChallengeStats);
router.route("/ai-suggest").post(getAISuggestions);
router.route("/update-all").post(updateAllUserChallenges);
router.route("/:id").get(getChallenge).patch(updateChallengeProgress).delete(deleteChallenge);

export default router;
