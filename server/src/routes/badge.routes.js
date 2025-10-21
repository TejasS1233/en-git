import { Router } from "express";
import { mintBadge, verifyBadge } from "../controllers/badge.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/mint", verifyJWT, mintBadge);
router.get("/verify", verifyJWT, verifyBadge);

export default router;


