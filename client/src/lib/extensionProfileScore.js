/**
 * Simplified profile score calculation for extension
 */

export function calculateProfileScore(stats) {
  if (!stats || !stats.user) return null;

  const { user, publicRepos, totalStars, topLanguages, followers, following } = stats;

  let score = 0;
  const tips = [];

  // 1. Profile Completeness (20 points)
  let profileScore = 0;
  if (user.name) profileScore += 5;
  else tips.push({ category: "Profile", tip: "Add your full name", points: 5 });

  if (user.bio) profileScore += 5;
  else tips.push({ category: "Profile", tip: "Add a bio", points: 5 });

  if (user.location) profileScore += 3;
  else tips.push({ category: "Profile", tip: "Add your location", points: 3 });

  if (user.company) profileScore += 3;
  else tips.push({ category: "Profile", tip: "Add your company", points: 3 });

  if (user.blog) profileScore += 2;
  else tips.push({ category: "Profile", tip: "Add your website", points: 2 });

  if (user.twitter_username) profileScore += 2;
  else tips.push({ category: "Profile", tip: "Link Twitter/X", points: 2 });

  score += profileScore;

  // 2. Repository Quality (30 points)
  let repoScore = 0;
  if (publicRepos >= 10) {
    repoScore += 10;
  } else {
    tips.push({
      category: "Repositories",
      tip: `Create more repos (${publicRepos}/10)`,
      points: 10 - Math.floor((publicRepos / 10) * 10),
    });
    repoScore += Math.floor((publicRepos / 10) * 10);
  }

  if (totalStars >= 100) {
    repoScore += 20;
  } else if (totalStars >= 50) {
    repoScore += 15;
  } else if (totalStars >= 10) {
    repoScore += 10;
  } else {
    tips.push({
      category: "Engagement",
      tip: "Build projects that attract stars",
      points: 20 - Math.floor((totalStars / 100) * 20),
    });
    repoScore += Math.floor((totalStars / 100) * 20);
  }

  score += repoScore;

  // 3. Skills & Diversity (20 points)
  let skillScore = 0;
  const langCount = topLanguages?.length || 0;

  if (langCount >= 5) {
    skillScore += 20;
  } else {
    tips.push({
      category: "Skills",
      tip: `Learn more languages (${langCount}/5)`,
      points: 20 - Math.floor((langCount / 5) * 20),
    });
    skillScore += Math.floor((langCount / 5) * 20);
  }

  score += skillScore;

  // 4. Community Engagement (15 points)
  let communityScore = 0;

  if (followers >= 100) {
    communityScore += 8;
  } else if (followers >= 50) {
    communityScore += 6;
  } else if (followers >= 10) {
    communityScore += 4;
  } else {
    tips.push({
      category: "Community",
      tip: "Engage to gain followers",
      points: 8 - Math.floor((followers / 100) * 8),
    });
    communityScore += Math.floor((followers / 100) * 8);
  }

  if (following >= 20) {
    communityScore += 4;
  } else {
    tips.push({
      category: "Community",
      tip: `Follow more devs (${following}/20)`,
      points: 4 - Math.floor((following / 20) * 4),
    });
    communityScore += Math.floor((following / 20) * 4);
  }

  const gists = user.public_gists || 0;
  if (gists >= 5) {
    communityScore += 3;
  } else {
    tips.push({
      category: "Sharing",
      tip: "Share code via gists",
      points: 3 - Math.floor((gists / 5) * 3),
    });
    communityScore += Math.floor((gists / 5) * 3);
  }

  score += communityScore;

  // 5. Activity & Consistency (15 points)
  let activityScore = 0;
  const accountAge = user.created_at
    ? Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 365))
    : 0;

  if (accountAge >= 2) {
    activityScore += 5;
  } else {
    activityScore += Math.floor((accountAge / 2) * 5);
  }

  if (publicRepos > 0 && accountAge > 0) {
    const reposPerYear = publicRepos / Math.max(accountAge, 1);
    if (reposPerYear >= 5) {
      activityScore += 10;
    } else {
      tips.push({
        category: "Activity",
        tip: "Create projects consistently",
        points: 10 - Math.floor((reposPerYear / 5) * 10),
      });
      activityScore += Math.floor((reposPerYear / 5) * 10);
    }
  }

  score += activityScore;

  // Calculate rating
  let rating = "Beginner";
  let ratingIcon = "🌱";

  if (score >= 90) {
    rating = "Elite";
    ratingIcon = "👑";
  } else if (score >= 75) {
    rating = "Expert";
    ratingIcon = "🏆";
  } else if (score >= 60) {
    rating = "Advanced";
    ratingIcon = "⭐";
  } else if (score >= 40) {
    rating = "Intermediate";
    ratingIcon = "📈";
  }

  // Sort tips by points (highest impact first)
  tips.sort((a, b) => b.points - a.points);

  return {
    score: Math.round(score),
    rating,
    ratingIcon,
    tips: tips.slice(0, 3), // Top 3 tips for compact display
  };
}
