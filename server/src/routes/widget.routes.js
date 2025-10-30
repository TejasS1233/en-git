import { Router } from "express";
import { generateWidget } from "../controllers/widget.controller.js";

const router = Router();

router.route("/:username").get(generateWidget);

export default router;
