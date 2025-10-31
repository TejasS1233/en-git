import mongoose, { Schema } from "mongoose";

const activityStreakSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    activityDates: [
      {
        type: Date,
        required: true,
      },
    ],
    totalAnalyses: {
      type: Number,
      default: 0,
    },
    // Store analyzed profiles for reference
    analyzedProfiles: [
      {
        githubUsername: {
          type: String,
          required: true,
        },
        analyzedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for efficient queries
activityStreakSchema.index({ userId: 1, username: 1 });
activityStreakSchema.index({ lastActivityDate: -1 });

// Method to check if activity was done today
activityStreakSchema.methods.hasActivityToday = function () {
  if (!this.lastActivityDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  return today.getTime() === lastActivity.getTime();
};

// Method to check if last activity was yesterday
activityStreakSchema.methods.wasActiveYesterday = function () {
  if (!this.lastActivityDate) return false;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  return yesterday.getTime() === lastActivity.getTime();
};

// Method to check if streak is broken
activityStreakSchema.methods.isStreakBroken = function () {
  if (!this.lastActivityDate) return true;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  // Streak is broken if more than 1 day has passed
  return daysDiff > 1;
};

// Method to update streak
activityStreakSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If already analyzed today, no change
  if (this.hasActivityToday()) {
    return {
      streakChanged: false,
      message: "Activity already recorded for today",
    };
  }
  
  // Check if streak is broken
  if (this.isStreakBroken() && !this.wasActiveYesterday()) {
    // Reset streak
    this.currentStreak = 1;
  } else {
    // Increment streak
    this.currentStreak += 1;
  }
  
  // Update longest streak if current is higher
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  // Update last activity date
  this.lastActivityDate = today;
  
  // Add to activity dates (keep unique dates)
  if (!this.activityDates.some(date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  })) {
    this.activityDates.push(today);
  }
  
  // Increment total analyses
  this.totalAnalyses += 1;
  
  return {
    streakChanged: true,
    newStreak: this.currentStreak,
    isNewRecord: this.currentStreak === this.longestStreak,
  };
};

// Method to get streak status
activityStreakSchema.methods.getStreakStatus = function () {
  return {
    currentStreak: this.currentStreak,
    longestStreak: this.longestStreak,
    totalAnalyses: this.totalAnalyses,
    lastActivityDate: this.lastActivityDate,
    hasActivityToday: this.hasActivityToday(),
    isActive: !this.isStreakBroken() || this.hasActivityToday(),
    daysUntilReset: this.isStreakBroken() ? 0 : 1,
  };
};

export const ActivityStreak = mongoose.model("ActivityStreak", activityStreakSchema);
