import cron from "node-cron";
import { updateAllActiveChallenges, expireOldChallenges } from "../services/challenge.service.js";

/**
 * Schedule challenge tracking jobs
 */
export function scheduleChallengeJobs() {
  // Update all active challenges every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("🔄 Running scheduled challenge update...");
    try {
      await updateAllActiveChallenges();
      console.log("✅ Challenge update completed");
    } catch (error) {
      console.error("❌ Challenge update failed:", error);
    }
  });

  // Check for expired challenges every hour
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Checking for expired challenges...");
    try {
      const count = await expireOldChallenges();
      if (count > 0) {
        console.log(`✅ Expired ${count} challenges`);
      }
    } catch (error) {
      console.error("❌ Failed to expire challenges:", error);
    }
  });

  console.log("📅 Challenge tracking jobs scheduled:");
  console.log("   - Update challenges: Every 6 hours");
  console.log("   - Expire old challenges: Every hour");
}
