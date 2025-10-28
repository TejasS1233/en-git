import { Router } from "express";
import { generateAgoraToken } from "../controllers/agora.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Get Agora token
router.get("/token", generateAgoraToken);

export default router;

