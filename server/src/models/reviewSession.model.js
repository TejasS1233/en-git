import mongoose from "mongoose";

const reviewSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    prUrl: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    repo: {
      type: String,
      required: true,
    },
    prNumber: {
      type: Number,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
    settings: {
      allowAnonymous: {
        type: Boolean,
        default: false,
      },
      maxParticipants: {
        type: Number,
        default: 10,
      },
    },
    status: {
      type: String,
      enum: ["active", "ended", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const ReviewSession = mongoose.model("ReviewSession", reviewSessionSchema);

