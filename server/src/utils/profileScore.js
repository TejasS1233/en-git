/**
 * Calculate GitHub profile score out of 100
 */
export function calculateProfileScore(insights) {
  if (!insights) return null;

  const { user, reposCount, languages, topStarred, topics } = insights;

  let score = 0;

  // 1. Profile Completeness (20 points)
  let profileScore = 0;
  if (user.name) profileScore += 5;
  if (user.bio) profileScore += 5;
  if (user.location) profileScore += 3;
  if (user.company) profileScore += 3;
  if (user.blog) profileScore += 2;
  if (user.twitter_username) profileScore += 2;
  score += profileScore;

  // 2. Repository Quality (30 points)
  let repoScore = 0;
  if (reposCount >= 10) {
    repoScore += 10;
  } else {
    repoScore += Math.floor((reposCount / 10) * 10);
  }

  const totalStars = topStarred?.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) || 0;
  if (totalStars >= 100) {
    repoScore += 10;
  } else if (totalStars >= 50) {
    repoScore += 7;
  } else if (totalStars >= 10) {
    repoScore += 5;
  } else {
    repoScore += Math.floor((totalStars / 100) * 10);
  }

  const hasReadmeRepos =
    topStarred?.filter((repo) => repo.description && repo.description.length > 0).length || 0;
  if (hasReadmeRepos >= 5) {
    repoScore += 10;
  } else {
    repoScore += Math.floor((hasReadmeRepos / 5) * 10);
  }
  score += repoScore;

  // 3. Skills & Diversity (25 points)
  let skillScore = 0;
  const langCount = Object.keys(languages?.percentages || {}).length;
  if (langCount >= 5) {
    skillScore += 13;
  } else {
    skillScore += Math.floor((langCount / 5) * 13);
  }

  if (topics?.length >= 10) {
    skillScore += 12;
  } else {
    skillScore += Math.floor(((topics?.length || 0) / 10) * 12);
  }
  score += skillScore;

  // 4. Community Engagement (10 points)
  let communityScore = 0;
  const followers = user.followers || 0;
  if (followers >= 100) {
    communityScore += 5;
  } else if (followers >= 50) {
    communityScore += 4;
  } else if (followers >= 10) {
    communityScore += 2;
  } else {
    communityScore += Math.floor((followers / 100) * 5);
  }

  const following = user.following || 0;
  if (following >= 20) {
    communityScore += 3;
  } else {
    communityScore += Math.floor((following / 20) * 3);
  }

  const gists = user.public_gists || 0;
  if (gists >= 5) {
    communityScore += 2;
  } else {
    communityScore += Math.floor((gists / 5) * 2);
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

  if (reposCount > 0 && accountAge > 0) {
    const reposPerYear = reposCount / Math.max(accountAge, 1);
    if (reposPerYear >= 5) {
      activityScore += 10;
    } else {
      activityScore += Math.floor((reposPerYear / 5) * 10);
    }
  }
  score += activityScore;

  // Calculate grade
  let grade = "F";
  if (score >= 90) grade = "A+";
  else if (score >= 85) grade = "A";
  else if (score >= 80) grade = "A-";
  else if (score >= 75) grade = "B+";
  else if (score >= 70) grade = "B";
  else if (score >= 65) grade = "B-";
  else if (score >= 60) grade = "C+";
  else if (score >= 55) grade = "C";
  else if (score >= 50) grade = "C-";
  else if (score >= 45) grade = "D+";
  else if (score >= 40) grade = "D";
  else if (score >= 35) grade = "D-";

  return {
    score: Math.round(score),
    grade,
  };
}
