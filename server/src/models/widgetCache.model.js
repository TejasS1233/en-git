import mongoose from "mongoose";

// Store full insights data for widgets
const widgetCacheSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    insights: {
      type: Object, // Store full insights JSON
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire after 30 days (2592000 seconds) - much longer to prevent data loss
widgetCacheSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 2592000 });

const WidgetCache = mongoose.model("WidgetCache", widgetCacheSchema);

export default WidgetCache;
