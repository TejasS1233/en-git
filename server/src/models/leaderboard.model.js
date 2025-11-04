import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: String,
    avatar: String,
    score: {
      type: Number,
      required: true,
      index: true,
    },
    grade: String,
    location: String,
    bio: String,
    publicRepos: Number,
    followers: Number,
    totalStars: Number,
    topLanguage: String,
    profileUrl: String,
    // Niche leaderboard data
    languages: [String], // All languages used
    topics: [String], // Topics/domains (web, mobile, ml, etc.)
    languageScores: {
      type: Map,
      of: Number,
    }, // Language-specific scores
  },
  {
    timestamps: true,
  }
);

// Indexes for niche leaderboards
leaderboardSchema.index({ languages: 1, score: -1 });
leaderboardSchema.index({ topics: 1, score: -1 });
leaderboardSchema.index({ topLanguage: 1, score: -1 });

// Index for sorting by score
leaderboardSchema.index({ score: -1, updatedAt: -1 });

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

export default Leaderboard;
