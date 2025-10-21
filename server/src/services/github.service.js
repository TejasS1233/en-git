import axios from "axios";
import NodeCache from "node-cache";
import pLimit from "p-limit";
import { load } from "cheerio";

const cache = new NodeCache({ stdTTL: 60 * 30, checkperiod: 120 }); // Default 30 min TTL

const gh = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
  },
  timeout: 15000,
});

function authHeader() {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function cachedGet(key, url, { params = {}, ttl, refresh = false } = {}) {
  if (refresh) {
    cache.del(key);
  } else {
    const hit = cache.get(key);
    // If we have a valid cache hit, return its data and timestamp
    if (hit && hit.data) {
      return [hit.data, hit.lastUpdated];
    }
  }

  try {
    const { data } = await gh.get(url, { params, headers: authHeader() });
    const lastUpdated = new Date().toISOString();
    // Set cache only if data is valid
    if (data) {
      cache.set(key, { data, lastUpdated }, ttl);
    }
    return [data, lastUpdated];
  } catch (error) {
    console.error(`GitHub API fetch failed for ${url}:`, error.message);
    // On error, return null data and a current timestamp to prevent caching bad results
    return [null, new Date().toISOString()];
  }
}

export async function fetchUser(username, refresh = false) {
  const ttl = 60 * 60; // 1 hour
  return cachedGet(`user:${username}`, `/users/${username}`, { ttl, refresh });
}

export async function fetchUserRepos(username, per_page = 100, refresh = false) {
  const pages = [1, 2, 3];
  const limit = pLimit(2);
  const ttl = 60 * 30; // 30 minutes

  const results = await Promise.all(
    pages.map((page) =>
      limit(() =>
        cachedGet(`repos:${username}:${page}`, `/users/${username}/repos`, {
          params: { per_page, page, sort: "updated" },
          ttl,
          refresh,
        })
      )
    )
  );

  // Filter out null results from failed fetches before processing
  const validResults = results.filter(([data]) => data !== null);
  const combinedData = validResults.map(([data]) => data).flat();
  
  const lastUpdated = validResults.reduce((latest, [, timestamp]) => {
    const currentTime = new Date(timestamp);
    return currentTime > latest ? currentTime : latest;
  }, new Date(0)); // Start with epoch for correct comparison

  return [combinedData, lastUpdated.toISOString()];
}

export async function fetchRepoLanguages(owner, repo, refresh = false) {
  const ttl = 60 * 30; // 30 minutes
  return cachedGet(`lang:${owner}/${repo}`, `/repos/${owner}/${repo}/languages`, { ttl, refresh });
}

export async function fetchRepoStats(owner, repo, refresh = false) {
  const ttl = 60 * 30; // 30 minutes
  const [commits, issues, pulls] = await Promise.all([
    cachedGet(`commits:${owner}/${repo}`, `/repos/${owner}/${repo}/commits`, {
      params: { per_page: 100 },
      ttl,
      refresh,
    }),
    cachedGet(`issues:${owner}/${repo}`, `/repos/${owner}/${repo}/issues`, {
      params: {
        state: "all",
        per_page: 100,
      },
      ttl,
      refresh,
    }),
    cachedGet(`prs:${owner}/${repo}`, `/repos/${owner}/${repo}/pulls`, {
      params: {
        state: "all",
        per_page: 100,
      },
      ttl,
      refresh,
    }),
  ]);

  const lastUpdated = [commits, issues, pulls].reduce((latest, current) => {
    if (!current || !current.lastUpdated) return latest;
    return new Date(current.lastUpdated) > new Date(latest) ? current.lastUpdated : latest;
  }, new Date(0).toISOString());

  return {
    data: {
      commits: commits.data,
      issues: issues.data,
      pulls: pulls.data,
    },
    lastUpdated,
  };
}

export async function fetchUserEvents(username, refresh = false) {
  const ttl = 60 * 30; // 30 minutes
  return cachedGet(`events:${username}`, `/users/${username}/events`, {
    params: { per_page: 100 },
    ttl,
    refresh,
  });
}

export async function fetchTrending(language = "", since = "daily", refresh = false) {
  const key = `trending:${language}:${since}`;
  if (!refresh) {
    const hit = cache.get(key);
    if (hit) return hit;
  }
  const url = `https://github.com/trending${language ? "/" + encodeURIComponent(language) : ""}?since=${since}`;
  const { data: html } = await axios.get(url, { timeout: 15000 });
  const $ = load(html);
  const items = [];
  $("article.Box-row").each((_, el) => {
    const $el = $(el);
    const fullName = $el.find("h2 a").text().trim().replace(/\s/g, "");
    const description = $el.find("p").text().trim();
    const stars =
      Number(
        $el.find("a.Link--muted[href$='stargazers']").first().text().trim().replace(/,/g, "")
      ) || 0;
    const lang = $el.find("span[itemprop='programmingLanguage']").text().trim();
    const href = "https://github.com/" + fullName;
    if (fullName) items.push({ fullName, description, stars, language: lang, url: href });
  });
  const value = { data: items, lastUpdated: new Date().toISOString() };
  cache.set(key, value, 60 * 30); // 30 minutes
  return value;
}
