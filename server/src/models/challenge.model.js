import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "commit_streak",
        "learn_language",
        "contribute_repos",
        "reach_stars",
        "daily_commits",
        "complete_repos",
        "custom",
      ],
    },
    target: {
      type: Number,
      required: true, // e.g., 30 for 30-day streak
    },
    current: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "failed", "paused"],
      default: "active",
    },
    progress: {
      type: Number,
      default: 0, // Percentage
      min: 0,
      max: 100,
    },
    metadata: {
      language: String, // For learn_language type
      description: String,
      milestone: String,
    },
    reminders: {
      enabled: Boolean,
      frequency: String, // daily, weekly
    },
    rewards: {
      badge: String,
      points: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
challengeSchema.index({ user: 1, status: 1 });
challengeSchema.index({ user: 1, type: 1 });

export const Challenge = mongoose.model("Challenge", challengeSchema);

