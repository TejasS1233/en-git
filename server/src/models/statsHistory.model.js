import mongoose, { Schema } from "mongoose";

const statsHistorySchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
    },
    metricType: {
      type: String,
      required: true,
      enum: [
        "followers",
        "following",
        "repos",
        "stars",
        "forks",
        "commits",
        "issues",
        "languages",
      ],
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    recordedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

statsHistorySchema.index({ username: 1, metricType: 1, recordedAt: -1 });

export const StatsHistory = mongoose.model("StatsHistory", statsHistorySchema);
