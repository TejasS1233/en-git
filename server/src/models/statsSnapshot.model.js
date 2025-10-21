import mongoose, { Schema } from "mongoose";

const statsSnapshotSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
    },
    snapshotDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    userData: {
      name: String,
      bio: String,
      avatar_url: String,
      public_repos: Number,
      followers: Number,
      following: Number,
      created_at: Date,
    },
    languages: {
      totals: Schema.Types.Mixed,
      percentages: [[String, Number]],
      top3: [[String, Number]],
    },
    domain: {
      domain: String,
      confidence: Number,
      keywords: [String],
    },
    reposCount: Number,
    topStarred: [Schema.Types.Mixed],
    topActive: [Schema.Types.Mixed],
    topics: [[String, Number]],
    commitTimes: {
      hours: [Number],
      profile: String,
    },
    totalStars: Number,
    totalForks: Number,
    totalIssues: Number,
  },
  {
    timestamps: true,
  }
);

statsSnapshotSchema.index({ username: 1, snapshotDate: -1 });

export const StatsSnapshot = mongoose.model("StatsSnapshot", statsSnapshotSchema);
