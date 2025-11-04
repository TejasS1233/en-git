import cron from "node-cron";
import { User } from "../models/user.model.js";
import Leaderboard from "../models/leaderboard.model.js";
import { sendEmail, sendBulkEmails } from "./email.service.js";
import { updateAllActiveChallenges, expireOldChallenges } from "./challenge.service.js";

// Store previous scores and ranks for comparison
const userHistory = new Map();

// Weekly Report - Every Monday at 9 AM
export function scheduleWeeklyReports() {
  cron.schedule("0 9 * * 1", async () => {
    console.log("📧 Running weekly report job...");

    try {
      // Get all users who opted in for weekly reports
      const users = await User.find({ "emailPreferences.weeklyReport": true }).lean();

      for (const user of users) {
        // Get user's leaderboard data
        const leaderboardData = await Leaderboard.findOne({
          username: user.githubUsername || user.fullname,
        }).lean();

        if (leaderboardData) {
          const rank =
            (await Leaderboard.countDocuments({ score: { $gt: leaderboardData.score } })) + 1;

          await sendEmail(user.email, "weeklyReport", user, {
            score: leaderboardData.score,
            rank,
            weeklyCommits: leaderboardData.weeklyActivity?.[0]?.[1] || 0,
            repoCount: leaderboardData.publicRepos,
          });
        }
      }

      console.log(`✅ Weekly reports sent to ${users.length} users`);
    } catch (error) {
      console.error("❌ Weekly report job failed:", error);
    }
  });

  console.log("✅ Weekly report cron job scheduled (Every Monday at 9 AM)");
}

// Score Change Alerts - Check every 6 hours
export function scheduleScoreAlerts() {
  cron.schedule("0 */6 * * *", async () => {
    console.log("📊 Checking for score changes...");

    try {
      const users = await User.find({ "emailPreferences.scoreAlerts": true }).lean();

      for (const user of users) {
        const leaderboardData = await Leaderboard.findOne({
          username: user.githubUsername || user.fullname,
        }).lean();

        if (leaderboardData) {
          const currentScore = leaderboardData.score;
          const previousScore = userHistory.get(user._id.toString())?.score;

          // If we have previous data and score changed significantly (>= 5 points)
          if (previousScore && Math.abs(currentScore - previousScore) >= 5) {
            await sendEmail(user.email, "scoreAlert", user, {
              oldScore: previousScore,
              newScore: currentScore,
              change: currentScore - previousScore,
            });
          }

          // Update history
          userHistory.set(user._id.toString(), { score: currentScore });
        }
      }

      console.log(`✅ Score alerts checked for ${users.length} users`);
    } catch (error) {
      console.error("❌ Score alert job failed:", error);
    }
  });

  console.log("✅ Score alert cron job scheduled (Every 6 hours)");
}

// Leaderboard Position Changes - Check every 12 hours
export function scheduleLeaderboardAlerts() {
  cron.schedule("0 */12 * * *", async () => {
    console.log("🏆 Checking for leaderboard changes...");

    try {
      const users = await User.find({ "emailPreferences.leaderboardUpdates": true }).lean();

      for (const user of users) {
        const leaderboardData = await Leaderboard.findOne({
          username: user.githubUsername || user.fullname,
        }).lean();

        if (leaderboardData) {
          const currentRank =
            (await Leaderboard.countDocuments({ score: { $gt: leaderboardData.score } })) + 1;
          const previousRank = userHistory.get(user._id.toString())?.rank;

          // If rank changed by 5 or more positions
          if (previousRank && Math.abs(currentRank - previousRank) >= 5) {
            await sendEmail(user.email, "leaderboardUpdate", user, {
              oldRank: previousRank,
              newRank: currentRank,
              rankChange: previousRank - currentRank, // Positive = moved up
            });
          }

          // Update history
          const history = userHistory.get(user._id.toString()) || {};
          userHistory.set(user._id.toString(), { ...history, rank: currentRank });
        }
      }

      console.log(`✅ Leaderboard alerts checked for ${users.length} users`);
    } catch (error) {
      console.error("❌ Leaderboard alert job failed:", error);
    }
  });

  console.log("✅ Leaderboard alert cron job scheduled (Every 12 hours)");
}

// Achievement notifications (called manually when achievement is unlocked)
export async function sendAchievementEmail(userId, achievementData) {
  try {
    const user = await User.findById(userId).lean();

    if (user && user.emailPreferences?.achievements) {
      await sendEmail(user.email, "achievement", user, achievementData);
      console.log(`✅ Achievement email sent to ${user.email}`);
    }
  } catch (error) {
    console.error("❌ Failed to send achievement email:", error);
  }
}

// Challenge Progress Updates - Every 6 hours
export function scheduleChallengeUpdates() {
  cron.schedule("0 */6 * * *", async () => {
    console.log("🎯 Updating active challenges...");

    try {
      const results = await updateAllActiveChallenges();
      console.log(`✅ Challenge update completed:`, results);
    } catch (error) {
      console.error("❌ Challenge update job failed:", error);
    }
  });

  console.log("✅ Challenge update cron job scheduled (Every 6 hours)");
}

// Expire Old Challenges - Every hour
export function scheduleExpireChallenges() {
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Checking for expired challenges...");

    try {
      const count = await expireOldChallenges();
      if (count > 0) {
        console.log(`✅ Expired ${count} challenges`);
      }
    } catch (error) {
      console.error("❌ Expire challenges job failed:", error);
    }
  });

  console.log("✅ Expire challenges cron job scheduled (Every hour)");
}

// Initialize all cron jobs
export function initializeCronJobs() {
  console.log("\n🕐 Initializing cron jobs...");
  scheduleWeeklyReports();
  scheduleScoreAlerts();
  scheduleLeaderboardAlerts();
  scheduleChallengeUpdates();
  scheduleExpireChallenges();
  console.log("✅ All cron jobs initialized\n");
}
