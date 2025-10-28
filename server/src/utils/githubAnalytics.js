// Utilities to compute analytics on GitHub data

function sortEntriesDesc(mapObj) {
  return Object.entries(mapObj).sort((a, b) => b[1] - a[1]);
}

export function aggregateLanguages(repos, repoLanguages, contributionRatios = new Map()) {
  const total = {};
  for (const r of repos) {
    const key = `${r.owner.login}/${r.name}`;
    const langs = repoLanguages.get(key) || {};
    
    // For forked repositories, scale by contribution ratio
    const isFork = r.fork || false;
    const contributionRatio = contributionRatios.get(key) || 1;
    
    // If it's a fork, scale the language stats by contribution ratio
    // If contribution ratio is 0 or very low (e.g., user made no commits to fork), exclude it
    const multiplier = isFork ? (contributionRatio > 0.01 ? contributionRatio : 0) : 1;
    
    for (const [lang, bytes] of Object.entries(langs)) {
      total[lang] = (total[lang] || 0) + bytes * multiplier;
    }
  }
  const sorted = sortEntriesDesc(total);
  const sum = sorted.reduce((acc, [, v]) => acc + v, 0) || 1;
  const percentages = sorted.map(([k, v]) => [k, Math.round((v / sum) * 1000) / 10]);
  return { totals: total, percentages, top3: percentages.slice(0, 3) };
}

export function mostStarred(repos, topN = 3) {
  const sorted = [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  return sorted.slice(0, topN);
}

export function mostActive(repos, topN = 3) {
  // activity by recent pushes + open issues + forks
  const scored = repos.map((r) => {
    const score =
      (r.open_issues_count || 0) * 1 + (r.forks_count || 0) * 0.5 + (r.stargazers_count || 0) * 0.2;
    return { ...r, _activityScore: score };
  });
  scored.sort((a, b) => b._activityScore - a._activityScore);
  return scored.slice(0, topN);
}

export function topicsFrequency(repos) {
  const freq = {};
  for (const r of repos) {
    const t = r.topics || [];
    for (const x of t) freq[x] = (freq[x] || 0) + 1;
  }
  return sortEntriesDesc(freq);
}

export function commitTimeDistribution(events) {
  // From public events, approximate push times
  const hours = Array.from({ length: 24 }, () => 0);
  for (const e of events || []) {
    const type = e.type;
    if (type === "PushEvent" || type === "PullRequestEvent" || type === "IssuesEvent") {
      const d = new Date(e.created_at);
      const h = d.getUTCHours();
      hours[h] += 1;
    }
  }
  const early = hours.slice(5, 12).reduce((a, b) => a + b, 0);
  const night =
    hours.slice(20).reduce((a, b) => a + b, 0) + hours.slice(0, 5).reduce((a, b) => a + b, 0);
  const profile = night > early ? "night-coder" : "early-bird";
  return { hours, profile };
}

export function weeklyActivity(events) {
  // group by ISO week (naive: YYYY-WW)
  const map = new Map();
  for (const e of events || []) {
    const d = new Date(e.created_at);
    const y = d.getUTCFullYear();
    const onejan = new Date(Date.UTC(y, 0, 1));
    const week = Math.ceil(((d - onejan) / 86400000 + onejan.getUTCDay() + 1) / 7);
    const key = `${y}-W${String(week).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).sort();
}
