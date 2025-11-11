import axios from "axios";

const statsCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const updateUserStatsCache = async (username, token = null) => {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
    };

    if (token || process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${token || process.env.GITHUB_TOKEN}`;
    }

    console.log(`🔄 Updating stats cache for: ${username}`);

    // Fetch fresh user data from GitHub
    const { data: user } = await axios.get(`https://api.github.com/users/${username}`, { headers });

    // Fetch user's repositories
    const { data: repos } = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    );

    // Calculate basic stats
    const stats = {
      username,
      publicRepos: user.public_repos,
      publicGists: user.public_gists,
      followers: user.followers,
      following: user.following,
      totalStars: repos.reduce((acc, repo) => acc + repo.stargazers_count, 0),
      totalForks: repos.reduce((acc, repo) => acc + repo.forks_count, 0),
      repositories: repos.length,
      updatedAt: new Date(),
    };

    // Cache the stats
    statsCache.set(username, {
      data: stats,
      timestamp: Date.now(),
    });

    console.log(`✅ Stats cache updated for: ${username}`);

    return stats;
  } catch (error) {
    console.error(`❌ Error updating stats cache for ${username}:`, error.message);
    throw error;
  }
};

/**
 * Get cached stats for a user
 * @param {string} username - GitHub username
 * @returns {Object|null} Cached stats or null if not found/expired
 */
export const getCachedStats = (username) => {
  const cached = statsCache.get(username);

  if (!cached) {
    return null;
  }

  // Check if cache is still valid
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;

  if (isExpired) {
    statsCache.delete(username);
    return null;
  }

  return cached.data;
};

/**
 * Invalidate cache for a user
 * @param {string} username - GitHub username
 */
export const invalidateCache = (username) => {
  statsCache.delete(username);
  console.log(`🗑️  Cache invalidated for: ${username}`);
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  statsCache.clear();
  console.log(`🗑️  All cache cleared`);
};
