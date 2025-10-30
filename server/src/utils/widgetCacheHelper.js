import WidgetCache from "../models/widgetCache.model.js";
import {
  fetchUser,
  fetchUserRepos,
  fetchRepoLanguages,
  fetchUserEvents,
  fetchUserCommits,
} from "../services/github.service.js";
import {
  aggregateLanguages,
  mostActive,
  mostStarred,
  topicsFrequency,
  commitTimeDistribution,
  weeklyActivity,
} from "../utils/githubAnalytics.js";
import { inferDomain } from "../utils/skillDomain.js";
import { calculateProfileScore } from "../utils/profileScore.js";
import pLimit from "p-limit";

/**
 * Get widget cache data, regenerating if missing or stale
 */
export async function getOrGenerateWidgetCache(username) {
  try {
    // Try to get from cache first
    let cached = await WidgetCache.findOne({ username }).lean();

    // If cache exists and is less than 6 hours old, return it
    if (cached && cached.lastUpdated) {
      const ageInHours = (Date.now() - new Date(cached.lastUpdated)) / (1000 * 60 * 60);
      if (ageInHours < 6) {
        console.log(`✅ Using cached data for ${username} (${ageInHours.toFixed(1)}h old)`);
        return cached.insights;
      }
    }

    // Cache is missing or stale - regenerate
    console.log(`🔄 Regenerating cache for ${username}...`);

    const [user] = await fetchUser(username);
    const [repos] = await fetchUserRepos(username);

    // Fetch languages per repo (limit concurrency)
    const limit = pLimit(5);
    const langEntries = await Promise.all(
      repos.map((r) =>
        limit(() =>
          fetchRepoLanguages(r.owner.login, r.name)
            .then(([langData]) => [r, langData])
            .catch(() => [r, {}])
        )
      )
    );
    const repoLanguages = new Map(langEntries.map(([r, l]) => [`${r.owner.login}/${r.name}`, l]));

    const [eventsData] = await fetchUserEvents(username).catch(() => [[]]);
    const commitsData = await fetchUserCommits(username, repos).catch(() => []);

    const languagesAgg = aggregateLanguages(repos, repoLanguages);
    const topics = topicsFrequency(repos);
    const commitTimes = commitTimeDistribution(eventsData || []);
    const weekly = weeklyActivity(eventsData || [], commitsData || []);
    const topStarred = mostStarred(repos, 3);
    const topActive = mostActive(repos, 3);
    const domain = inferDomain(languagesAgg.percentages, topics.slice(0, 10));

    const insightsData = {
      user,
      reposCount: repos.length,
      languages: languagesAgg,
      topics: topics.slice(0, 20),
      topStarred,
      topActive,
      commitTimes,
      weekly,
      domain,
    };

    insightsData.profileScore = calculateProfileScore(insightsData);

    // Save to cache
    await WidgetCache.findOneAndUpdate(
      { username },
      { username, insights: insightsData, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    console.log(`✅ Cache regenerated for ${username}`);
    return insightsData;
  } catch (error) {
    console.error(`❌ Failed to get/generate cache for ${username}:`, error.message);
    return null;
  }
}
