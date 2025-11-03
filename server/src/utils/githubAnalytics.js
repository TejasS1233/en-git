// Utilities to compute analytics on GitHub data

function sortEntriesDesc(mapObj) {
  return Object.entries(mapObj).sort((a, b) => b[1] - a[1]);
}

export function aggregateLanguages(repos, repoLanguages) {
  const total = {};
  for (const r of repos) {
    const key = `${r.owner.login}/${r.name}`;
    const langs = repoLanguages.get(key) || {};
    for (const [lang, bytes] of Object.entries(langs)) {
      total[lang] = (total[lang] || 0) + bytes;
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

export function commitTimeDistribution(events, timezoneOffset = 0) {
  // From public events, approximate push times
  // timezoneOffset is in minutes (e.g., -300 for EST, 330 for IST)
  const hours = Array.from({ length: 24 }, () => 0);

  for (const e of events || []) {
    const type = e.type;
    if (type === "PushEvent" || type === "PullRequestEvent" || type === "IssuesEvent") {
      const d = new Date(e.created_at);
      // Convert UTC to local time using timezone offset
      const utcHour = d.getUTCHours();
      const utcMinute = d.getUTCMinutes();
      const totalMinutes = utcHour * 60 + utcMinute + timezoneOffset;

      // Handle day wraparound
      let localHour = Math.floor(totalMinutes / 60);
      if (localHour < 0) localHour += 24;
      if (localHour >= 24) localHour -= 24;

      hours[localHour] += 1;
    }
  }

  const early = hours.slice(5, 12).reduce((a, b) => a + b, 0);
  const night =
    hours.slice(20).reduce((a, b) => a + b, 0) + hours.slice(0, 5).reduce((a, b) => a + b, 0);
  const profile = night > early ? "night-coder" : "early-bird";
  return { hours, profile };
}

export function weeklyActivity(events, commits = []) {
  // group by ISO week (naive: YYYY-WW)
  const map = new Map();

  // Process events
  for (const e of events || []) {
    const d = new Date(e.created_at);
    const y = d.getUTCFullYear();
    const onejan = new Date(Date.UTC(y, 0, 1));
    const week = Math.ceil(((d - onejan) / 86400000 + onejan.getUTCDay() + 1) / 7);
    const key = `${y}-W${String(week).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + 1);
  }

  // Process commits (more reliable for historical data)
  for (const c of commits || []) {
    const d = new Date(c.commit?.author?.date || c.commit?.committer?.date);
    if (!d || isNaN(d.getTime())) continue;
    const y = d.getUTCFullYear();
    const onejan = new Date(Date.UTC(y, 0, 1));
    const week = Math.ceil(((d - onejan) / 86400000 + onejan.getUTCDay() + 1) / 7);
    const key = `${y}-W${String(week).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + 1);
  }

  // Return only actual data, sorted by week (newest first)
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}
