/**
 * Calculate GitHub profile score out of 100
 * with actionable tips for improvement
 */

export function calculateProfileScore(insights) {
  if (!insights) return null;

  const { user, reposCount, languages, topStarred, domain, topics } = insights;

  let score = 0;
  const tips = [];
  const achievements = [];

  // 1. Profile Completeness (20 points)
  let profileScore = 0;
  if (user.name) {
    profileScore += 5;
    achievements.push("✓ Full name added");
  } else {
    tips.push({ category: "Profile", tip: "Add your full name", points: 5 });
  }

  if (user.bio) {
    profileScore += 5;
    achievements.push("✓ Bio added");
  } else {
    tips.push({ category: "Profile", tip: "Add a bio to describe yourself", points: 5 });
  }

  if (user.location) {
    profileScore += 3;
    achievements.push("✓ Location added");
  } else {
    tips.push({ category: "Profile", tip: "Add your location", points: 3 });
  }

  if (user.company) {
    profileScore += 3;
    achievements.push("✓ Company added");
  } else {
    tips.push({ category: "Profile", tip: "Add your company/organization", points: 3 });
  }

  if (user.blog) {
    profileScore += 2;
    achievements.push("✓ Website/blog added");
  } else {
    tips.push({ category: "Profile", tip: "Add your website or blog", points: 2 });
  }

  if (user.twitter_username) {
    profileScore += 2;
    achievements.push("✓ Twitter linked");
  } else {
    tips.push({ category: "Profile", tip: "Link your Twitter/X account", points: 2 });
  }

  score += profileScore;

  // 2. Repository Quality (30 points)
  let repoScore = 0;
  if (reposCount >= 10) {
    repoScore += 10;
    achievements.push(`✓ ${reposCount} repositories`);
  } else {
    tips.push({
      category: "Repositories",
      tip: `Create more repositories (currently ${reposCount}/10)`,
      points: 10 - Math.floor((reposCount / 10) * 10),
    });
    repoScore += Math.floor((reposCount / 10) * 10);
  }

  const totalStars = topStarred?.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) || 0;

  if (totalStars >= 100) {
    repoScore += 10;
    achievements.push(`✓ ${totalStars} stars earned`);
  } else if (totalStars >= 50) {
    repoScore += 7;
    achievements.push(`✓ ${totalStars} stars earned`);
  } else if (totalStars >= 10) {
    repoScore += 5;
    achievements.push(`✓ ${totalStars} stars`);
  } else {
    tips.push({
      category: "Engagement",
      tip: "Build projects that attract stars",
      points: 10 - Math.floor((totalStars / 100) * 10),
    });
    repoScore += Math.floor((totalStars / 100) * 10);
  }

  // Check for README in repos
  const hasReadmeRepos =
    topStarred?.filter((repo) => repo.description && repo.description.length > 0).length || 0;

  if (hasReadmeRepos >= 5) {
    repoScore += 10;
    achievements.push("✓ Good documentation");
  } else {
    tips.push({
      category: "Documentation",
      tip: `Add descriptions to more repos (${hasReadmeRepos}/5 have descriptions)`,
      points: 10 - Math.floor((hasReadmeRepos / 5) * 10),
    });
    repoScore += Math.floor((hasReadmeRepos / 5) * 10);
  }

  score += repoScore;

  // 3. Skills & Diversity (20 points)
  let skillScore = 0;
  const langCount = languages?.percentages?.length || 0;

  if (langCount >= 5) {
    skillScore += 10;
    achievements.push(`✓ ${langCount} languages used`);
  } else {
    tips.push({
      category: "Skills",
      tip: `Learn more languages (currently ${langCount}/5)`,
      points: 10 - Math.floor((langCount / 5) * 10),
    });
    skillScore += Math.floor((langCount / 5) * 10);
  }

  if (topics?.length >= 10) {
    skillScore += 10;
    achievements.push(`✓ ${topics.length} topics covered`);
  } else {
    tips.push({
      category: "Topics",
      tip: `Add topics to repositories (${topics?.length || 0}/10)`,
      points: 10 - Math.floor(((topics?.length || 0) / 10) * 10),
    });
    skillScore += Math.floor(((topics?.length || 0) / 10) * 10);
  }

  score += skillScore;

  // 4. Community Engagement (15 points)
  let communityScore = 0;
  const followers = user.followers || 0;

  if (followers >= 100) {
    communityScore += 8;
    achievements.push(`✓ ${followers} followers`);
  } else if (followers >= 50) {
    communityScore += 6;
    achievements.push(`✓ ${followers} followers`);
  } else if (followers >= 10) {
    communityScore += 4;
    achievements.push(`✓ ${followers} followers`);
  } else {
    tips.push({
      category: "Community",
      tip: "Engage more with the community to gain followers",
      points: 8,
    });
    communityScore += Math.floor((followers / 100) * 8);
  }

  const following = user.following || 0;
  if (following >= 20) {
    communityScore += 4;
    achievements.push("✓ Active community member");
  } else {
    tips.push({
      category: "Community",
      tip: `Follow more developers (${following}/20)`,
      points: 4 - Math.floor((following / 20) * 4),
    });
    communityScore += Math.floor((following / 20) * 4);
  }

  const gists = user.public_gists || 0;
  if (gists >= 5) {
    communityScore += 3;
    achievements.push(`✓ ${gists} gists shared`);
  } else {
    tips.push({
      category: "Sharing",
      tip: "Share code snippets via gists",
      points: 3,
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
    achievements.push(`✓ ${accountAge}+ years on GitHub`);
  } else {
    activityScore += Math.floor((accountAge / 2) * 5);
  }

  if (reposCount > 0 && accountAge > 0) {
    const reposPerYear = reposCount / Math.max(accountAge, 1);
    if (reposPerYear >= 5) {
      activityScore += 10;
      achievements.push("✓ Consistently active");
    } else {
      tips.push({
        category: "Activity",
        tip: "Create projects more consistently",
        points: 10 - Math.floor((reposPerYear / 5) * 10),
      });
      activityScore += Math.floor((reposPerYear / 5) * 10);
    }
  }

  score += activityScore;

  // Calculate rating
  let rating = "Beginner";
  let ratingColor = "text-gray-500";
  let ratingIcon = "🌱";

  if (score >= 90) {
    rating = "Elite";
    ratingColor = "text-purple-600";
    ratingIcon = "👑";
  } else if (score >= 75) {
    rating = "Expert";
    ratingColor = "text-blue-600";
    ratingIcon = "🏆";
  } else if (score >= 60) {
    rating = "Advanced";
    ratingColor = "text-green-600";
    ratingIcon = "⭐";
  } else if (score >= 40) {
    rating = "Intermediate";
    ratingColor = "text-yellow-600";
    ratingIcon = "📈";
  } else if (score >= 20) {
    rating = "Beginner";
    ratingColor = "text-orange-600";
    ratingIcon = "🌱";
  }

  // Sort tips by points (highest impact first)
  tips.sort((a, b) => b.points - a.points);

  return {
    score: Math.round(score),
    rating,
    ratingColor,
    ratingIcon,
    tips: tips.slice(0, 5), // Top 5 tips
    achievements,
    breakdown: {
      profile: Math.round((profileScore / 20) * 100),
      repositories: Math.round((repoScore / 30) * 100),
      skills: Math.round((skillScore / 20) * 100),
      community: Math.round((communityScore / 15) * 100),
      activity: Math.round((activityScore / 15) * 100),
    },
  };
}

/**
 * Get personalized improvement plan
 */
export function getImprovementPlan(profileScore) {
  if (!profileScore) return null;

  const { score, tips } = profileScore;

  let timeframe = "1-2 weeks";
  if (score >= 75) timeframe = "Ongoing";
  else if (score >= 50) timeframe = "2-4 weeks";
  else timeframe = "1-2 months";

  return {
    timeframe,
    priority: tips.slice(0, 3),
    potentialScore: Math.min(100, score + tips.slice(0, 3).reduce((sum, t) => sum + t.points, 0)),
  };
}
