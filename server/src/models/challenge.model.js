import mongoose, { Schema } from "mongoose";

const challengeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    githubUsername: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "followers",
        "stars",
        "repo_stars",
        "commits",
        "pull_requests",
        "issues_closed",
        "contributions",
        "streak_days",
        "repos_created",
        "forks",
        "watchers",
        "languages_used",
      ],
      required: true,
    },
    targetValue: {
      type: Number,
      required: true,
      min: 1,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    startValue: {
      type: Number,
      required: true,
    },
    repoName: {
      type: String,
      trim: true,
      // Required only for repo-specific challenges
      required: function () {
        return ["repo_stars", "forks", "watchers"].includes(this.type);
      },
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "legendary"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["growth", "activity", "quality", "social", "streak"],
      default: "growth",
    },
    rewards: {
      xp: { type: Number, default: 0 },
      badge: { type: String },
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "failed", "expired"],
      default: "active",
      index: true,
    },
    completedAt: {
      type: Date,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    milestones: [
      {
        value: { type: Number, required: true },
        reached: { type: Boolean, default: false },
        reachedAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient queries
challengeSchema.index({ userId: 1, status: 1 });
challengeSchema.index({ githubUsername: 1, status: 1 });
challengeSchema.index({ deadline: 1, status: 1 });

// Calculate progress percentage
challengeSchema.methods.getProgress = function () {
  const total = this.targetValue - this.startValue;
  const current = this.currentValue - this.startValue;
  return Math.min(Math.max((current / total) * 100, 0), 100);
};

// Check if challenge is expired
challengeSchema.methods.isExpired = function () {
  return new Date() > this.deadline && this.status === "active";
};

// Update challenge status based on current value
challengeSchema.methods.updateStatus = function () {
  if (this.currentValue >= this.targetValue) {
    this.status = "completed";
    this.completedAt = new Date();
  } else if (this.isExpired()) {
    this.status = "expired";
  }
  return this.status;
};

export const Challenge = mongoose.model("Challenge", challengeSchema);
