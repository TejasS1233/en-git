import { Router } from "express";
import {
  handleGitHubWebhook,
  refreshUserStats,
  webhookHealth,
  getWebhookToken,
  regenerateWebhookToken,
} from "../controllers/webhook.controller.js";
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Health check
router.get("/health", webhookHealth);

// GitHub webhook endpoint (needs raw body for signature verification)
router.post(
  "/github",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // Convert raw body back to JSON
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString());
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON payload" });
      }
    }
    next();
  },
  handleGitHubWebhook
);

// Manual stats refresh (for GitHub Actions) - No auth required, uses webhook token
router.post("/refresh-stats", refreshUserStats);

// Get user's webhook token - Requires authentication
router.get("/token", verifyJWT, getWebhookToken);

// Regenerate webhook token - Requires authentication
router.post("/regenerate-token", verifyJWT, regenerateWebhookToken);

export default router;
