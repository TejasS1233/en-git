import { Router } from "express";
import { generateWidget } from "../controllers/widget.controller.js";
import WidgetCache from "../models/widgetCache.model.js";

const router = Router();

// Debug endpoint to inspect cache
router.route("/debug/:username").get(async (req, res) => {
  try {
    const { username } = req.params;
    const cached = await WidgetCache.findOne({ username }).lean();

    if (!cached) {
      return res.json({ error: "No cache found", username });
    }

    return res.json({
      username,
      cacheExists: true,
      insightsKeys: cached.insights ? Object.keys(cached.insights) : [],
      insights: cached.insights,
      lastUpdated: cached.lastUpdated,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.route("/:username").get(generateWidget);

export default router;
