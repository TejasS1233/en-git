import { Router } from "express";
import { getUserAchievements } from "../controllers/achievements.controller.js";

const router = Router();

router.route("/:username").get(getUserAchievements);

export default router;
