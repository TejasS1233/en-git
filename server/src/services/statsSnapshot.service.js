import { StatsSnapshot } from "../models/statsSnapshot.model.js";
import { StatsHistory } from "../models/statsHistory.model.js";
import {
  fetchUser,
  fetchUserRepos,
  fetchRepoLanguages,
  fetchUserEvents,
} from "./github.service.js";
import {
  aggregateLanguages,
  mostActive,
  mostStarred,
  topicsFrequency,
  commitTimeDistribution,
} from "../utils/githubAnalytics.js";
import { inferDomain } from "../utils/skillDomain.js";
import pLimit from "p-limit";

export async function captureSnapshot(username) {
  const [user] = await fetchUser(username);
  const [repos] = await fetchUserRepos(username);

  const limit = pLimit(5);
  const langEntries = await Promise.all(
    repos.map((r) =>
      limit(() =>
        fetchRepoLanguages(r.owner.login, r.name)
          .then(([languages]) => [r, languages]) // Destructure the tuple here
          .catch(() => [r, {}])
      )
    )
  );
  const repoLanguages = new Map(langEntries.map(([r, l]) => [`${r.owner.login}/${r.name}`, l]));

  const [events] = await fetchUserEvents(username).catch(() => [[], null]);

  const languagesAgg = aggregateLanguages(repos, repoLanguages);
  const topics = topicsFrequency(repos);
  const commitTimes = commitTimeDistribution(events);
  const topStarredRepos = mostStarred(repos, 3);
  const topActiveRepos = mostActive(repos, 3);

  const domain = inferDomain(languagesAgg.percentages, topics.slice(0, 10));

  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const totalIssues = repos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0);

  const snapshot = await StatsSnapshot.create({
    username,
    snapshotDate: new Date(),
    userData: {
      name: user.name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      created_at: user.created_at,
    },
    languages: languagesAgg,
    domain,
    reposCount: repos.length,
    topStarred: topStarredRepos,
    topActive: topActiveRepos,
    topics: topics.slice(0, 20),
    commitTimes,
    totalStars,
    totalForks,
    totalIssues,
  });

  await StatsHistory.insertMany([
    { username, metricType: "followers", value: user.followers, recordedAt: new Date() },
    { username, metricType: "following", value: user.following, recordedAt: new Date() },
    { username, metricType: "repos", value: user.public_repos, recordedAt: new Date() },
    { username, metricType: "stars", value: totalStars, recordedAt: new Date() },
    { username, metricType: "forks", value: totalForks, recordedAt: new Date() },
  ]);

  return snapshot;
}

export async function getHistoricalSnapshots(username, startDate, endDate) {
  const query = { username };
  if (startDate || endDate) {
    query.snapshotDate = {};
    if (startDate) query.snapshotDate.$gte = new Date(startDate);
    if (endDate) query.snapshotDate.$lte = new Date(endDate);
  }

  return await StatsSnapshot.find(query).sort({ snapshotDate: -1 }).lean();
}

export async function getMetricHistory(username, metricType, startDate, endDate) {
  const query = { username, metricType };
  if (startDate || endDate) {
    query.recordedAt = {};
    if (startDate) query.recordedAt.$gte = new Date(startDate);
    if (endDate) query.recordedAt.$lte = new Date(endDate);
  }

  return await StatsHistory.find(query).sort({ recordedAt: 1 }).lean();
}

export async function compareSnapshots(username, period = "month") {
  const now = new Date();
  const pastDate = new Date();

  if (period === "week") {
    pastDate.setDate(now.getDate() - 7);
  } else if (period === "month") {
    pastDate.setMonth(now.getMonth() - 1);
  } else if (period === "year") {
    pastDate.setFullYear(now.getFullYear() - 1);
  }

  const [currentSnapshot, pastSnapshot] = await Promise.all([
    StatsSnapshot.findOne({ username }).sort({ snapshotDate: -1 }),
    StatsSnapshot.findOne({ username, snapshotDate: { $lte: pastDate } }).sort({
      snapshotDate: -1,
    }),
  ]);

  if (!currentSnapshot) {
    return null;
  }

  if (!pastSnapshot) {
    return { current: currentSnapshot, past: null, changes: null };
  }

  const changes = {
    followers: currentSnapshot.userData.followers - pastSnapshot.userData.followers,
    following: currentSnapshot.userData.following - pastSnapshot.userData.following,
    repos: currentSnapshot.userData.public_repos - pastSnapshot.userData.public_repos,
    stars: currentSnapshot.totalStars - pastSnapshot.totalStars,
    forks: currentSnapshot.totalForks - pastSnapshot.totalForks,
  };

  return { current: currentSnapshot, past: pastSnapshot, changes };
}

export async function generateTrendData(username, period = "month", metricTypes) {
  const startDate = new Date();
  if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === "3months") {
    startDate.setMonth(startDate.getMonth() - 3);
  } else if (period === "6months") {
    startDate.setMonth(startDate.getMonth() - 6);
  } else if (period === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  console.log(`Generating trend data for ${username}, period: ${period}, start date: ${startDate}`);

  const metrics = metricTypes || ["followers", "repos", "stars"];
  const trends = {};

  for (const metric of metrics) {
    const history = await getMetricHistory(username, metric, startDate);
    console.log(`History for ${metric}:`, history.length, "records");
    trends[metric] = history.map((h) => ({
      date: h.recordedAt,
      value: h.value,
    }));
  }

  console.log(
    "Generated trends:",
    Object.keys(trends).map((k) => `${k}: ${trends[k].length} points`)
  );

  return trends;
}
