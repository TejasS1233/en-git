import { Challenge } from "../models/challenge.model.js";

/**
 * Calculate challenge statistics for achievement tracking
 */
export async function getChallengeAchievementData(userId) {
  try {
    const challenges = await Challenge.find({ userId });

    const completed = challenges.filter((c) => c.status === "completed");
    const failed = challenges.filter((c) => c.status === "failed" || c.status === "expired");
    const active = challenges.filter((c) => c.status === "active");

    // Calculate total XP earned
    const totalXP = completed.reduce((sum, c) => sum + (c.rewards?.xp || 0), 0);

    // Count legendary and hard challenges completed
    const legendaryCompleted = completed.filter((c) => c.difficulty === "legendary").length;
    const hardCompleted = completed.filter((c) =>
      ["hard", "legendary"].includes(c.difficulty)
    ).length;

    // Calculate fastest and longest completion times
    let fastestCompletion = 999;
    let longestCompletion = 0;

    completed.forEach((challenge) => {
      if (challenge.completedAt && challenge.createdAt) {
        const days = Math.floor(
          (new Date(challenge.completedAt) - new Date(challenge.createdAt)) / (1000 * 60 * 60 * 24)
        );
        if (days < fastestCompletion) fastestCompletion = days;
        if (days > longestCompletion) longestCompletion = days;
      }
    });

    // Count unique challenge types completed
    const uniqueTypes = new Set(completed.map((c) => c.type));

    // Calculate success rate
    const total = completed.length + failed.length;
    const successRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    return {
      completed: completed.length,
      failed: failed.length,
      total: challenges.length,
      totalXP,
      successRate,
      legendaryCompleted,
      hardCompleted,
      fastestCompletion: fastestCompletion === 999 ? 0 : fastestCompletion,
      longestCompletion,
      maxActive: active.length,
      uniqueTypes: uniqueTypes.size,
    };
  } catch (error) {
    console.error("Failed to calculate challenge achievement data:", error);
    return {
      completed: 0,
      failed: 0,
      total: 0,
      totalXP: 0,
      successRate: 0,
      legendaryCompleted: 0,
      hardCompleted: 0,
      fastestCompletion: 0,
      longestCompletion: 0,
      maxActive: 0,
      uniqueTypes: 0,
    };
  }
}

/**
 * Check and award challenge-related achievements
 */
export async function checkChallengeAchievements(userId) {
  const challengeData = await getChallengeAchievementData(userId);

  const newAchievements = [];

  // Check for milestone achievements
  const milestones = [
    { count: 1, id: "challenge_accepted" },
    { count: 5, id: "goal_getter" },
    { count: 10, id: "determined" },
    { count: 25, id: "achiever" },
    { count: 50, id: "unstoppable_force" },
    { count: 100, id: "challenge_master" },
    { count: 250, id: "legendary_challenger" },
  ];

  milestones.forEach((milestone) => {
    if (challengeData.completed === milestone.count) {
      newAchievements.push(milestone.id);
    }
  });

  // Check XP milestones
  const xpMilestones = [
    { xp: 1000, id: "xp_hunter" },
    { xp: 5000, id: "xp_master" },
    { xp: 10000, id: "xp_legend" },
  ];

  xpMilestones.forEach((milestone) => {
    if (challengeData.totalXP >= milestone.xp) {
      newAchievements.push(milestone.id);
    }
  });

  // Check special achievements
  if (challengeData.legendaryCompleted >= 1) {
    newAchievements.push("legendary_conqueror");
  }

  if (challengeData.hardCompleted >= 10) {
    newAchievements.push("hard_mode");
  }

  if (challengeData.fastestCompletion > 0 && challengeData.fastestCompletion <= 7) {
    newAchievements.push("speed_runner");
  }

  if (challengeData.longestCompletion >= 90) {
    newAchievements.push("marathon_runner");
  }

  if (challengeData.maxActive >= 5) {
    newAchievements.push("multitasker");
  }

  if (challengeData.maxActive >= 10) {
    newAchievements.push("juggler");
  }

  if (challengeData.uniqueTypes >= 12) {
    newAchievements.push("diverse_challenger");
  }

  if (
    challengeData.completed >= 10 &&
    challengeData.failed === 0 &&
    challengeData.successRate === 100
  ) {
    newAchievements.push("perfectionist");
  }

  if (challengeData.completed >= 20 && challengeData.successRate >= 90) {
    newAchievements.push("overachiever");
  }

  return {
    challengeData,
    newAchievements,
  };
}
