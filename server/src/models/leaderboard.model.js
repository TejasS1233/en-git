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
  },
  {
    timestamps: true,
  }
);

// Index for sorting by score
leaderboardSchema.index({ score: -1, updatedAt: -1 });

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

export default Leaderboard;
