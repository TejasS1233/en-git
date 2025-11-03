/**
 * Comprehensive Achievement System with Icons
 * Uses Lucide React icon names
 */

export const ACHIEVEMENT_CATEGORIES = {
  SCORE: "score",
  STARS: "stars",
  REPOS: "repos",
  FOLLOWERS: "followers",
  LANGUAGES: "languages",
  ACTIVITY: "activity",
  SPECIAL: "special",
  COMMUNITY: "community",
};

export const ACHIEVEMENT_TIERS = {
  BRONZE: { name: "Bronze", color: "#CD7F32", order: 1 },
  SILVER: { name: "Silver", color: "#C0C0C0", order: 2 },
  GOLD: { name: "Gold", color: "#FFD700", order: 3 },
  PLATINUM: { name: "Platinum", color: "#E5E4E2", order: 4 },
  DIAMOND: { name: "Diamond", color: "#B9F2FF", order: 5 },
  LEGENDARY: { name: "Legendary", color: "#FF6B35", order: 6 },
};

// Define all achievements with unlock conditions
export const ACHIEVEMENTS = [
  // SCORE ACHIEVEMENTS
  {
    id: "first_steps",
    name: "First Steps",
    description: "Reach a profile score of 10",
    icon: "Baby",
    category: ACHIEVEMENT_CATEGORIES.SCORE,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.score >= 10,
    progress: (data) => Math.min((data.score / 10) * 100, 100),
    secret: false,
  },
  {
    id: "getting_started",
    name: "Getting Started",
    description: "Reach a profile score of 25",
    icon: "Sprout",
    category: ACHIEVEMENT_CATEGORIES.SCORE,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.score >= 25,
    progress: (data) => Math.min((data.score / 25) * 100, 100),
    secret: false,
  },
  {
    id: "skilled_coder",
    name: "Skilled Coder",
    description: "Reach a profile score of 50",
    icon: "Code2",
    category: ACHIEVEMENT_CATEGORIES.SCORE,
    tier: ACHIEVEMENT_TIERS.SILVER,
    condition: (data) => data.score >= 50,
    progress: (data) => Math.min((data.score / 50) * 100, 100),
    secret: false,
  },
  {
    id: "advanced_developer",
    name: "Advanced Developer",
    description: "Reach a profile score of 70",
    icon: "Rocket",
    category: ACHIEVEMENT_CATEGORIES.SCORE,
    tier: ACHIEVEMENT_TIERS.GOLD,
    condition: (data) => data.score >= 70,
    progress: (data) => Math.min((data.score / 70) * 100, 100),
    secret: false,
  },
  {
    id: "expert_coder",
    name: "Expert Coder",
    description: "Reach a profile score of 85",
    icon: "Trophy",
    category: ACHIEVEMENT_CATEGORIES.SCORE,
    tier: ACHIEVEMENT_TIERS.PLATINUM,
    condition: (data) => data.score >= 85,
    progress: (data) => Math.min((data.score / 85) * 100, 100),
    secret: false,
  },
  {
    id: "elite_developer",
    name: "Elite Developer",
    description: "Reach a perfect score of 95+",
    icon: "Crown",
    category: ACHIEVEMENT_CATEGORIES.SCORE,
    tier: ACHIEVEMENT_TIERS.LEGENDARY,
    condition: (data) => data.score >= 95,
    progress: (data) => Math.min((data.score / 95) * 100, 100),
    secret: false,
  },

  // STARS ACHIEVEMENTS
  {
    id: "first_star",
    name: "First Star",
    description: "Get your first star",
    icon: "Star",
    category: ACHIEVEMENT_CATEGORIES.STARS,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.totalStars >= 1,
    progress: (data) => Math.min((data.totalStars / 1) * 100, 100),
    secret: false,
  },
  {
    id: "star_gazer",
    name: "Star Gazer",
    description: "Collect 50 stars",
    icon: "Sparkles",
    category: ACHIEVEMENT_CATEGORIES.STARS,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.totalStars >= 50,
    progress: (data) => Math.min((data.totalStars / 50) * 100, 100),
    secret: false,
  },
  {
    id: "rising_star",
    name: "Rising Star",
    description: "Collect 250 stars",
    icon: "Sparkle",
    category: ACHIEVEMENT_CATEGORIES.STARS,
    tier: ACHIEVEMENT_TIERS.SILVER,
    condition: (data) => data.totalStars >= 250,
    progress: (data) => Math.min((data.totalStars / 250) * 100, 100),
    secret: false,
  },
  {
    id: "star_collector",
    name: "Star Collector",
    description: "Collect 1,000 stars",
    icon: "Stars",
    category: ACHIEVEMENT_CATEGORIES.STARS,
    tier: ACHIEVEMENT_TIERS.GOLD,
    condition: (data) => data.totalStars >= 1000,
    progress: (data) => Math.min((data.totalStars / 1000) * 100, 100),
    secret: false,
  },
  {
    id: "supernova",
    name: "Supernova",
    description: "Collect 5,000 stars",
    icon: "Zap",
    category: ACHIEVEMENT_CATEGORIES.STARS,
    tier: ACHIEVEMENT_TIERS.PLATINUM,
    condition: (data) => data.totalStars >= 5000,
    progress: (data) => Math.min((data.totalStars / 5000) * 100, 100),
    secret: false,
  },
  {
    id: "galaxy",
    name: "Galaxy",
    description: "Collect 10,000 stars",
    icon: "Orbit",
    category: ACHIEVEMENT_CATEGORIES.STARS,
    tier: ACHIEVEMENT_TIERS.DIAMOND,
    condition: (data) => data.totalStars >= 10000,
    progress: (data) => Math.min((data.totalStars / 10000) * 100, 100),
    secret: false,
  },

  // REPOSITORY ACHIEVEMENTS
  {
    id: "hello_world",
    name: "Hello World",
    description: "Create your first repository",
    icon: "Package",
    category: ACHIEVEMENT_CATEGORIES.REPOS,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.publicRepos >= 1,
    progress: (data) => Math.min((data.publicRepos / 1) * 100, 100),
    secret: false,
  },
  {
    id: "active_builder",
    name: "Active Builder",
    description: "Create 10 repositories",
    icon: "Hammer",
    category: ACHIEVEMENT_CATEGORIES.REPOS,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.publicRepos >= 10,
    progress: (data) => Math.min((data.publicRepos / 10) * 100, 100),
    secret: false,
  },
  {
    id: "prolific_creator",
    name: "Prolific Creator",
    description: "Create 25 repositories",
    icon: "Construction",
    category: ACHIEVEMENT_CATEGORIES.REPOS,
    tier: ACHIEVEMENT_TIERS.SILVER,
    condition: (data) => data.publicRepos >= 25,
    progress: (data) => Math.min((data.publicRepos / 25) * 100, 100),
    secret: false,
  },
  {
    id: "project_master",
    name: "Project Master",
    description: "Create 50 repositories",
    icon: "Target",
    category: ACHIEVEMENT_CATEGORIES.REPOS,
    tier: ACHIEVEMENT_TIERS.GOLD,
    condition: (data) => data.publicRepos >= 50,
    progress: (data) => Math.min((data.publicRepos / 50) * 100, 100),
    secret: false,
  },
  {
    id: "code_factory",
    name: "Code Factory",
    description: "Create 100 repositories",
    icon: "Factory",
    category: ACHIEVEMENT_CATEGORIES.REPOS,
    tier: ACHIEVEMENT_TIERS.PLATINUM,
    condition: (data) => data.publicRepos >= 100,
    progress: (data) => Math.min((data.publicRepos / 100) * 100, 100),
    secret: false,
  },

  // FOLLOWER ACHIEVEMENTS
  {
    id: "first_follower",
    name: "First Follower",
    description: "Get your first follower",
    icon: "UserPlus",
    category: ACHIEVEMENT_CATEGORIES.FOLLOWERS,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.followers >= 1,
    progress: (data) => Math.min((data.followers / 1) * 100, 100),
    secret: false,
  },
  {
    id: "popular_dev",
    name: "Popular Dev",
    description: "Reach 50 followers",
    icon: "Users",
    category: ACHIEVEMENT_CATEGORIES.FOLLOWERS,
    tier: ACHIEVEMENT_TIERS.SILVER,
    condition: (data) => data.followers >= 50,
    progress: (data) => Math.min((data.followers / 50) * 100, 100),
    secret: false,
  },
  {
    id: "community_leader",
    name: "Community Leader",
    description: "Reach 250 followers",
    icon: "Award",
    category: ACHIEVEMENT_CATEGORIES.FOLLOWERS,
    tier: ACHIEVEMENT_TIERS.GOLD,
    condition: (data) => data.followers >= 250,
    progress: (data) => Math.min((data.followers / 250) * 100, 100),
    secret: false,
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "Reach 1,000 followers",
    icon: "Megaphone",
    category: ACHIEVEMENT_CATEGORIES.FOLLOWERS,
    tier: ACHIEVEMENT_TIERS.PLATINUM,
    condition: (data) => data.followers >= 1000,
    progress: (data) => Math.min((data.followers / 1000) * 100, 100),
    secret: false,
  },
  {
    id: "celebrity",
    name: "Celebrity",
    description: "Reach 5,000 followers",
    icon: "Flame",
    category: ACHIEVEMENT_CATEGORIES.FOLLOWERS,
    tier: ACHIEVEMENT_TIERS.DIAMOND,
    condition: (data) => data.followers >= 5000,
    progress: (data) => Math.min((data.followers / 5000) * 100, 100),
    secret: false,
  },

  // LANGUAGE ACHIEVEMENTS
  {
    id: "monolingual",
    name: "Monolingual",
    description: "Master 1 programming language",
    icon: "FileCode",
    category: ACHIEVEMENT_CATEGORIES.LANGUAGES,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.languageCount >= 1,
    progress: (data) => Math.min((data.languageCount / 1) * 100, 100),
    secret: false,
  },
  {
    id: "bilingual",
    name: "Bilingual",
    description: "Code in 3 languages",
    icon: "MessageSquare",
    category: ACHIEVEMENT_CATEGORIES.LANGUAGES,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.languageCount >= 3,
    progress: (data) => Math.min((data.languageCount / 3) * 100, 100),
    secret: false,
  },
  {
    id: "multilingual",
    name: "Multilingual",
    description: "Code in 5 languages",
    icon: "Languages",
    category: ACHIEVEMENT_CATEGORIES.LANGUAGES,
    tier: ACHIEVEMENT_TIERS.SILVER,
    condition: (data) => data.languageCount >= 5,
    progress: (data) => Math.min((data.languageCount / 5) * 100, 100),
    secret: false,
  },
  {
    id: "polyglot",
    name: "Polyglot",
    description: "Code in 10 languages",
    icon: "Globe",
    category: ACHIEVEMENT_CATEGORIES.LANGUAGES,
    tier: ACHIEVEMENT_TIERS.GOLD,
    condition: (data) => data.languageCount >= 10,
    progress: (data) => Math.min((data.languageCount / 10) * 100, 100),
    secret: false,
  },
  {
    id: "language_master",
    name: "Language Master",
    description: "Code in 20 languages",
    icon: "GraduationCap",
    category: ACHIEVEMENT_CATEGORIES.LANGUAGES,
    tier: ACHIEVEMENT_TIERS.PLATINUM,
    condition: (data) => data.languageCount >= 20,
    progress: (data) => Math.min((data.languageCount / 20) * 100, 100),
    secret: false,
  },

  // ACTIVITY ACHIEVEMENTS
  {
    id: "weekend_warrior",
    name: "Weekend Warrior",
    description: "Code on weekends",
    icon: "Palmtree",
    category: ACHIEVEMENT_CATEGORIES.ACTIVITY,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    condition: (data) => data.weekendActivity >= 10,
    progress: (data) => Math.min((data.weekendActivity / 10) * 100, 100),
    secret: false,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Code between midnight and 6 AM (your local time)",
    icon: "Moon",
    category: ACHIEVEMENT_CATEGORIES.ACTIVITY,
    tier: ACHIEVEMENT_TIERS.SILVER,
    condition: (data) => data.nightActivity >= 20,
    progress: (data) => Math.min((data.nightActivity / 20) * 100, 100),
    secret: false,
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Code between 5 AM and 9 AM (your local time)",
    icon: "Sunrise",
    category: ACHIEVEMENT_CATEGORIES.ACTIVITY,
    tier: ACHIEVEMENT_TIERS.SILVER,
    condition: (data) => data.morningActivity >= 20,
    progress: (data) => Math.min((data.morningActivity / 20) * 100, 100),
    secret: false,
  },
  {
    id: "consistent_contributor",
    name: "Consistent Contributor",
    description: "Be active for 30 days",
    icon: "Flame",
    category: ACHIEVEMENT_CATEGORIES.ACTIVITY,
    tier: ACHIEVEMENT_TIERS.GOLD,
    condition: (data) => data.activeDays >= 30,
    progress: (data) => Math.min((data.activeDays / 30) * 100, 100),
    secret: false,
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Be active for 100 days",
    icon: "Zap",
    category: ACHIEVEMENT_CATEGORIES.ACTIVITY,
    tier: ACHIEVEMENT_TIERS.PLATINUM,
    condition: (data) => data.activeDays >= 100,
    progress: (data) => Math.min((data.activeDays / 100) * 100, 100),
    secret: false,
  },
  {
    id: "year_round",
    name: "Year Round",
    description: "Be active for 365 days",
    icon: "PartyPopper",
    category: ACHIEVEMENT_CATEGORIES.ACTIVITY,
    tier: ACHIEVEMENT_TIERS.LEGENDARY,
    condition: (data) => data.activeDays >= 365,
    progress: (data) => Math.min((data.activeDays / 365) * 100, 100),
    secret: false,
  },

  // SPECIAL/SECRET ACHIEVEMENTS
  {
    id: "perfect_score",
    name: "Perfectionist",
    description: "Achieve a perfect 100 score",
    icon: "Gem",
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    tier: ACHIEVEMENT_TIERS.LEGENDARY,
    condition: (data) => data.score >= 100,
    progress: (data) => Math.min((data.score / 100) * 100, 100),
    secret: true,
  },
  {
    id: "grade_a_plus",
    name: "Straight A+",
    description: "Achieve Grade A+",
    icon: "Diamond",
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    tier: ACHIEVEMENT_TIERS.DIAMOND,
    condition: (data) => data.grade === "A+",
    progress: (data) => (data.grade === "A+" ? 100 : 0),
    secret: false,
  },
  {
    id: "top_10",
    name: "Top 10",
    description: "Reach top 10 on the leaderboard",
    icon: "Medal",
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    tier: ACHIEVEMENT_TIERS.GOLD,
    condition: (data) => data.rank <= 10,
    progress: (data) => (data.rank <= 10 ? 100 : Math.max(100 - data.rank, 0)),
    secret: false,
  },
  {
    id: "number_one",
    name: "#1",
    description: "Reach #1 on the leaderboard",
    icon: "Crown",
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    tier: ACHIEVEMENT_TIERS.LEGENDARY,
    condition: (data) => data.rank === 1,
    progress: (data) => (data.rank === 1 ? 100 : 0),
    secret: true,
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "GitHub account older than 5 years",
    icon: "Shield",
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    tier: ACHIEVEMENT_TIERS.GOLD,
    condition: (data) => data.accountAge >= 5,
    progress: (data) => Math.min((data.accountAge / 5) * 100, 100),
    secret: false,
  },
  {
    id: "ancient",
    name: "Ancient",
    description: "GitHub account older than 10 years",
    icon: "Landmark",
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    tier: ACHIEVEMENT_TIERS.LEGENDARY,
    condition: (data) => data.accountAge >= 10,
    progress: (data) => Math.min((data.accountAge / 10) * 100, 100),
    secret: true,
  },
];

/**
 * Calculate user achievements based on their data
 */
export function calculateAchievements(userData, insights) {
  const data = {
    score: userData.score || 0,
    grade: userData.grade || "F",
    totalStars: userData.totalStars || 0,
    publicRepos: userData.publicRepos || 0,
    followers: userData.followers || 0,
    rank: userData.rank || 999999,
    languageCount: insights?.languages?.percentages?.length || 0,
    weekendActivity: calculateWeekendActivity(insights),
    nightActivity: calculateNightActivity(insights),
    morningActivity: calculateMorningActivity(insights),
    activeDays: calculateActiveDays(insights),
    accountAge: calculateAccountAge(userData),
  };

  const unlocked = [];
  const locked = [];

  ACHIEVEMENTS.forEach((achievement) => {
    const isUnlocked = achievement.condition(data);
    const progress = achievement.progress(data);

    if (isUnlocked) {
      unlocked.push({
        ...achievement,
        progress: 100,
        unlockedAt: new Date(),
      });
    } else {
      locked.push({
        ...achievement,
        progress: Math.round(progress),
      });
    }
  });

  return {
    unlocked: unlocked.sort((a, b) => b.tier.order - a.tier.order),
    locked: locked.sort((a, b) => b.progress - a.progress),
    total: ACHIEVEMENTS.length,
    unlockedCount: unlocked.length,
    completionPercentage: Math.round((unlocked.length / ACHIEVEMENTS.length) * 100),
  };
}

// Helper functions
function calculateWeekendActivity(insights) {
  if (!insights?.weekly) return 0;
  return insights.weekly.slice(0, 12).reduce((sum, [, count]) => sum + count, 0) / 4;
}

function calculateNightActivity(insights) {
  if (!insights?.commitTimes?.hours) return 0;
  const nightHours = [0, 1, 2, 3, 4, 5];
  return nightHours.reduce((sum, hour) => sum + (insights.commitTimes.hours[hour] || 0), 0);
}

function calculateMorningActivity(insights) {
  if (!insights?.commitTimes?.hours) return 0;
  const morningHours = [5, 6, 7, 8, 9];
  return morningHours.reduce((sum, hour) => sum + (insights.commitTimes.hours[hour] || 0), 0);
}

function calculateActiveDays(insights) {
  if (!insights?.weekly) return 0;
  // Count total weeks with activity and multiply by 7 to get approximate active days
  const activeWeeks = insights.weekly.filter(([, count]) => count > 0).length;
  return activeWeeks * 7;
}

function calculateAccountAge(userData) {
  if (!userData.createdAt) return 0;
  const created = new Date(userData.createdAt);
  const now = new Date();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24 * 365));
}
