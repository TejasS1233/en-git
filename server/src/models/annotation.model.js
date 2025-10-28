import mongoose from "mongoose";

const annotationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    annotationId: {
      type: String,
      required: true,
      unique: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    lineStart: {
      type: Number,
      required: true,
    },
    lineEnd: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["comment", "suggestion", "question", "approval", "request_changes"],
      default: "comment",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Annotation",
      default: null,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    mirroredToGitHub: {
      type: Boolean,
      default: false,
    },
    githubCommentId: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Annotation = mongoose.model("Annotation", annotationSchema);

