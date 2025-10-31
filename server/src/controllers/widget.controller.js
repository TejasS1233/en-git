import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import Leaderboard from "../models/leaderboard.model.js";
import { getOrGenerateWidgetCache } from "../utils/widgetCacheHelper.js";

// Generate Trophy Widget
async function generateTrophyWidget(username, theme, customColors = {}) {
    const isDark = theme === 'dark';
    const accentColor = customColors.accent || (isDark ? '#58a6ff' : '#0969da');
    const backgroundColor = isDark ? '#1a1a1a' : '#fff';
    const textColor = isDark ? '#fff' : '#000';

    // --- MOCK DATA FRAMEWORK ---
    const mockTrophies = [
        { name: 'Gold Contributor', emoji: '🥇' },
        { name: 'Hacktoberfest 2025', emoji: '🎃' },
        { name: 'Top Reviewer', emoji: '👀' },
    ];
    let trophiesHtml = mockTrophies.map((trophy, index) => {
        const xPos = 50 + (index * 100); 
        return `
            <text x='${xPos}' y='80' fill='${accentColor}' text-anchor='middle' font-size='30'>
                ${trophy.emoji}
            </text>
            <text x='${xPos}' y='110' fill='${textColor}' text-anchor='middle' font-size='10'>
                ${trophy.name}
            </text>
        `;
    }).join('');
    return `
<svg width='350' height='150' viewBox='0 0 350 150' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='350' height='150' fill='${backgroundColor}' rx='6' />

    <text x='175' y='30' fill='${textColor}' text-anchor='middle' font-weight='bold' font-size='16'>
        ${username}'s Achievements
    </text>

    <g transform="translate(0, 30)">
        ${trophiesHtml}
    </g>

    <text x='175' y='140' fill='${accentColor}' text-anchor='middle' font-size='10'>
        Framework Implemented - Ready for Data Hookup
    </text>
</svg>`;
}

// Generate SVG widget
export const generateWidget = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { type = "card", theme = "dark" } = req.query;

  console.log(`\n🎨 Widget Request: ${username}, type: ${type}, theme: ${theme}`);

  // Debug: Check MongoDB connection
  const mongoose = (await import("mongoose")).default;
  console.log(`MongoDB connection state: ${mongoose.connection.readyState}`); // 1 = connected
  console.log(`MongoDB database name: ${mongoose.connection.name}`);

  // Get custom colors from query params
  const customColors = {
    accent: req.query.accent,
    success: req.query.success,
    purple: req.query.purple,
  };

  // Skip leaderboard check for repo widgets
  if (type === "repo" || type === "contributors") {
    const repo = req.query.repo;
    if (!repo) {
      return res.status(400).send("Missing repo parameter. Use: ?type=repo&repo=owner/repo");
    }
    const svg =
      type === "repo"
        ? await generateRepoWidget(repo, theme, customColors)
        : await generateContributorsWidget(repo, theme, customColors);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=1800, stale-while-revalidate=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("CDN-Cache-Control", "public, max-age=3600");
    return res.send(svg);
  }

  // Fetch user data from leaderboard
  const userData = await Leaderboard.findOne({ username }).lean();
  console.log(`Leaderboard data found: ${!!userData}`);

  if (!userData) {
    // Return a "not found" SVG instead of error
    const notFoundSvg = generateNotFoundSvg(username, theme);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=86400"); // Cache for 5 min, serve stale for 24h
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    return res.send(notFoundSvg);
  }

  // Calculate rank
  const rank = (await Leaderboard.countDocuments({ score: { $gt: userData.score } })) + 1;
  userData.rank = rank;

  let svg;
  switch (type) {
    case "card":
      svg = generateCardWidget(userData, theme, customColors);
      break;
    case "stats":
      svg = generateStatsWidget(userData, theme, customColors);
      break;
    case "full":
      svg = generateFullWidget(userData, theme, customColors);
      break;
    case "languages":
      svg = await generateLanguageChartWidget(username, theme, customColors);
      break;
    case "activity":
      svg = await generateYearlyContributionWidget(username, theme, customColors);
      break;
    case "commits":
      svg = await generateCommitTimesWidget(username, theme, customColors);
      break;
    case "skills":
      svg = await generateSkillsWidget(username, theme, customColors);
      break;
    case "score":
      svg = await generateScoreWidget(username, theme, customColors);
      break;
    case "trophy":
      svg = generateTrophyWidget(userData, theme, customColors);
      break;
    case "repo":
      // For repo widget, get repo from query parameter
      const repo = req.query.repo;
      if (!repo) {
        return res.status(400).send("Missing repo parameter. Use: ?type=repo&repo=owner/repo");
      }
      svg = await generateRepoWidget(repo, theme, customColors);
      break;
    default:
      svg = generateCardWidget(userData, theme, customColors);
  }

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=1800, stale-while-revalidate=86400"); // Cache for 30 min, serve stale for 24h
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins for widgets
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("CDN-Cache-Control", "public, max-age=3600"); // CDN cache for 1 hour
  res.send(svg);
});

// Card Widget (300x180)
function generateCardWidget(user, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#58a6ff" : "#0969da");

  // Use a placeholder circle with initials instead of avatar to avoid CORS
  const initial = (user.name || user.username).charAt(0).toUpperCase();

  return `
    <svg width="300" height="180" viewBox="-10 -10 320 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.05" />
        </linearGradient>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.6" />
        </linearGradient>
      </defs>
      
      <rect width="300" height="180" fill="${bg}" stroke="${border}" stroke-width="1" rx="6"/>
      <rect width="300" height="180" fill="url(#grad)" rx="6"/>
      
      <!-- Profile Circle with Initial -->
      <circle cx="40" cy="40" r="25" fill="url(#avatarGrad)"/>
      <text x="40" y="48" fill="${bg}" font-size="20" font-weight="700" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        ${initial}
      </text>
      
      <!-- Name -->
      <text x="75" y="35" fill="${text}" font-size="16" font-weight="600" font-family="system-ui, -apple-system, sans-serif">
        ${escapeXml(user.name || user.username)}
      </text>
      
      <!-- Username -->
      <text x="75" y="52" fill="${subtext}" font-size="12" font-family="system-ui, -apple-system, sans-serif">
        @${escapeXml(user.username)}
      </text>
      
      <!-- Score -->
      <text x="20" y="95" fill="${subtext}" font-size="11" font-family="system-ui, -apple-system, sans-serif">
        SCORE
      </text>
      <text x="20" y="120" fill="${accent}" font-size="28" font-weight="700" font-family="system-ui, -apple-system, sans-serif">
        ${user.score}
      </text>
      <text x="70" y="120" fill="${text}" font-size="16" font-family="system-ui, -apple-system, sans-serif">
        Grade ${user.grade}
      </text>
      
      <!-- Stats -->
      <text x="20" y="150" fill="${subtext}" font-size="11" font-family="system-ui, -apple-system, sans-serif">
        ${user.publicRepos} repos • ${user.totalStars} stars • Rank #${user.rank || "N/A"}
      </text>
      
      <!-- Top Language -->
      ${user.topLanguage
      ? `<text x="20" y="168" fill="${accent}" font-size="10" font-family="system-ui, -apple-system, sans-serif">
        ⚡ ${escapeXml(user.topLanguage)}
      </text>`
      : ""
    }
      
      <!-- Powered by -->
      <text x="250" y="172" fill="${subtext}" font-size="8" font-family="system-ui, -apple-system, sans-serif">
        en-git
      </text>
    </svg>
  `;
}

function generateStatsWidget(user, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#58a6ff" : "#0969da");

  return `
    <svg width="400" height="120" viewBox="-10 -10 420 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" fill="${bg}" stroke="${border}" stroke-width="1" rx="6"/>
      
      <!-- Stats Grid -->
      <g transform="translate(20, 30)">
        <!-- Score -->
        <text x="0" y="0" fill="${subtext}" font-size="11" font-family="system-ui, -apple-system, sans-serif">SCORE</text>
        <text x="0" y="25" fill="${accent}" font-size="24" font-weight="700" font-family="system-ui, -apple-system, sans-serif">${user.score}</text>
        <text x="0" y="45" fill="${text}" font-size="12" font-family="system-ui, -apple-system, sans-serif">Grade ${user.grade}</text>
      </g>
      
      <g transform="translate(120, 30)">
        <!-- Repos -->
        <text x="0" y="0" fill="${subtext}" font-size="11" font-family="system-ui, -apple-system, sans-serif">REPOS</text>
        <text x="0" y="25" fill="${text}" font-size="20" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${user.publicRepos}</text>
      </g>
      
      <g transform="translate(210, 30)">
        <!-- Stars -->
        <text x="0" y="0" fill="${subtext}" font-size="11" font-family="system-ui, -apple-system, sans-serif">STARS</text>
        <text x="0" y="25" fill="${text}" font-size="20" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${user.totalStars}</text>
      </g>
      
      <g transform="translate(300, 30)">
        <!-- Rank -->
        <text x="0" y="0" fill="${subtext}" font-size="11" font-family="system-ui, -apple-system, sans-serif">RANK</text>
        <text x="0" y="25" fill="${accent}" font-size="20" font-weight="600" font-family="system-ui, -apple-system, sans-serif">#${user.rank || "N/A"}</text>
      </g>
      
      <!-- Username -->
      <text x="20" y="95" fill="${subtext}" font-size="12" font-family="system-ui, -apple-system, sans-serif">
        @${escapeXml(user.username)}
      </text>
      
      <text x="350" y="110" fill="${subtext}" font-size="8" font-family="system-ui, -apple-system, sans-serif">
        en-git
      </text>
    </svg>
  `;
}

// Badge Widget (200x80)
function generateBadgeWidget(user, theme) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const accent = isDark ? "#58a6ff" : "#0969da";

  return `
    <svg width="200" height="80" viewBox="-10 -10 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="80" fill="${bg}" stroke="${border}" stroke-width="1" rx="6"/>
      
      <text x="100" y="30" fill="${text}" font-size="12" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        en-git Score
      </text>
      
      <text x="100" y="55" fill="${accent}" font-size="24" font-weight="700" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        ${user.score}
      </text>
      
      <text x="100" y="72" fill="${text}" font-size="10" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        Grade ${user.grade}
      </text>
    </svg>
  `;
}

// Rank Widget (250x100)
function generateRankWidget(user, theme) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = isDark ? "#58a6ff" : "#0969da";

  const trophy = user.rank === 1 ? "🏆" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : "🎯";

  return `
    <svg width="250" height="100" viewBox="-10 -10 270 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="250" height="100" fill="${bg}" stroke="${border}" stroke-width="1" rx="6"/>
      
      <text x="125" y="35" fill="${text}" font-size="28" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        ${trophy} Rank #${user.rank || "N/A"}
      </text>
      
      <text x="125" y="60" fill="${subtext}" font-size="12" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        @${escapeXml(user.username)}
      </text>
      
      <text x="125" y="80" fill="${accent}" font-size="14" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        Score: ${user.score} • Grade ${user.grade}
      </text>
    </svg>
  `;
}

// Not Found SVG
function generateNotFoundSvg(username, theme) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = isDark ? "#58a6ff" : "#0969da";

  return `
    <svg width="300" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="180" fill="${bg}" stroke="${border}" stroke-width="1" rx="6"/>
      
      <text x="150" y="70" fill="${text}" font-size="16" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        @${escapeXml(username)}
      </text>
      
      <text x="150" y="95" fill="${subtext}" font-size="12" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        Profile not analyzed yet
      </text>
      
      <text x="150" y="120" fill="${accent}" font-size="11" font-weight="500" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        Visit en-git.vercel.app
      </text>
      
      <text x="150" y="140" fill="${subtext}" font-size="10" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        to analyze this profile
      </text>
    </svg>
  `;
}

// Helper to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Full Widget with visual elements (495x195)
function generateFullWidget(user, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#58a6ff" : "#0969da");
  const success = customColors.success || (isDark ? "#3fb950" : "#1a7f37");
  const warning = isDark ? "#d29922" : "#9a6700";

  const initial = (user.name || user.username).charAt(0).toUpperCase();

  return `
    <svg width="495" height="195" viewBox="-10 -10 515 215" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:0.05" />
          <stop offset="100%" style="stop-color:${success};stop-opacity:0.05" />
        </linearGradient>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accent}" />
          <stop offset="100%" style="stop-color:${success}" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="495" height="195" fill="${bg}" stroke="${border}" stroke-width="1" rx="8"/>
      <rect width="495" height="195" fill="url(#bgGrad)" rx="8"/>
      
      <!-- Header Section -->
      <g transform="translate(20, 20)">
        <!-- Avatar Circle -->
        <circle cx="30" cy="30" r="28" fill="url(#scoreGrad)"/>
        <text x="30" y="38" fill="${bg}" font-size="24" font-weight="700" font-family="system-ui" text-anchor="middle">
          ${initial}
        </text>
        
        <!-- Name & Username -->
        <text x="70" y="30" fill="${text}" font-size="18" font-weight="600" font-family="system-ui">
          ${escapeXml(user.name || user.username)}
        </text>
        <text x="70" y="48" fill="${subtext}" font-size="13" font-family="system-ui">
          @${escapeXml(user.username)}
        </text>
      </g>
      
      <!-- Score Section -->
      <g transform="translate(20, 90)">
        <text x="0" y="0" fill="${subtext}" font-size="11" font-family="system-ui" font-weight="600">PROFILE SCORE</text>
        <text x="0" y="30" fill="url(#scoreGrad)" font-size="36" font-weight="700" font-family="system-ui">
          ${user.score}
        </text>
        <text x="70" y="30" fill="${text}" font-size="18" font-family="system-ui">
          Grade ${user.grade}
        </text>
        
        <!-- Rank Badge -->
        <rect x="0" y="45" width="100" height="24" fill="${accent}" fill-opacity="0.1" rx="12"/>
        <text x="50" y="61" fill="${accent}" font-size="12" font-weight="600" font-family="system-ui" text-anchor="middle">
          Rank #${user.rank || "N/A"}
        </text>
      </g>
      
      <!-- Stats Grid -->
      <g transform="translate(180, 90)">
        <!-- Repos -->
        <g>
          <rect width="90" height="70" fill="${accent}" fill-opacity="0.05" rx="6"/>
          <text x="45" y="25" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="middle">REPOS</text>
          <text x="45" y="50" fill="${accent}" font-size="20" font-weight="700" font-family="system-ui" text-anchor="middle">
            ${user.publicRepos}
          </text>
        </g>
        
        <!-- Stars -->
        <g transform="translate(100, 0)">
          <rect width="90" height="70" fill="${warning}" fill-opacity="0.05" rx="6"/>
          <text x="45" y="25" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="middle">STARS</text>
          <text x="45" y="50" fill="${warning}" font-size="20" font-weight="700" font-family="system-ui" text-anchor="middle">
            ${user.totalStars}
          </text>
        </g>
        
        <!-- Followers -->
        <g transform="translate(200, 0)">
          <rect width="90" height="70" fill="${success}" fill-opacity="0.05" rx="6"/>
          <text x="45" y="25" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="middle">FOLLOWERS</text>
          <text x="45" y="50" fill="${success}" font-size="20" font-weight="700" font-family="system-ui" text-anchor="middle">
            ${user.followers}
          </text>
        </g>
      </g>
      
      <!-- Top Language Badge -->
      ${user.topLanguage
      ? `<g transform="translate(20, 170)">
        <rect width="120" height="20" fill="${accent}" fill-opacity="0.1" rx="10"/>
        <text x="60" y="14" fill="${accent}" font-size="11" font-weight="600" font-family="system-ui" text-anchor="middle">
          ${escapeXml(user.topLanguage)}
        </text>
      </g>`
      : ""
    }
      
      <!-- Branding -->
      <text x="470" y="185" fill="${subtext}" font-size="9" font-family="system-ui" text-anchor="end">
        en-git
      </text>
    </svg>
  `;
}

// Compact Widget (350x100)
function generateCompactWidget(user, theme) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = isDark ? "#58a6ff" : "#0969da";

  return `
    <svg width="350" height="100" viewBox="-10 -10 370 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="compactGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accent}" />
          <stop offset="100%" style="stop-color:#a855f7" />
        </linearGradient>
      </defs>
      
      <rect width="350" height="100" fill="${bg}" stroke="${border}" stroke-width="1" rx="6"/>
      
      <!-- Left: Score -->
      <g transform="translate(20, 30)">
        <text x="0" y="0" fill="${subtext}" font-size="10" font-family="system-ui">SCORE</text>
        <text x="0" y="30" fill="url(#compactGrad)" font-size="28" font-weight="700" font-family="system-ui">
          ${user.score}
        </text>
        <text x="0" y="50" fill="${text}" font-size="11" font-family="system-ui">
          Grade ${user.grade}
        </text>
      </g>
      
      <!-- Divider -->
      <line x1="100" y1="20" x2="100" y2="80" stroke="${border}" stroke-width="1"/>
      
      <!-- Right: Stats -->
      <g transform="translate(120, 35)">
        <text x="0" y="0" fill="${text}" font-size="14" font-weight="600" font-family="system-ui">
          @${escapeXml(user.username)}
        </text>
        <text x="0" y="22" fill="${subtext}" font-size="11" font-family="system-ui">
          ${user.publicRepos} repos • ${user.totalStars} stars • Rank #${user.rank || "N/A"}
        </text>
        ${user.topLanguage
      ? `<text x="0" y="40" fill="${accent}" font-size="10" font-family="system-ui">
          ${escapeXml(user.topLanguage)}
        </text>`
      : ""
    }
      </g>
      
      <text x="330" y="92" fill="${subtext}" font-size="8" font-family="system-ui" text-anchor="end">
        en-git
      </text>
    </svg>
  `;
}

// Language Chart Widget (500x320) - Enhanced
async function generateLanguageChartWidget(username, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const bgSecondary = isDark ? "#161b22" : "#f6f8fa";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#58a6ff" : "#0969da");

  // Get or generate cache data
  const insights = await getOrGenerateWidgetCache(username);

  if (!insights || !insights.languages) {
    console.log(`❌ No languages data available for ${username}`);
    return generateNotFoundSvg(username, theme);
  }

  const languagesData = insights.languages;
  const languages =
    languagesData.top3 ||
    languagesData.percentages?.slice(0, 3).map(([lang, pct]) => [lang, pct]) ||
    [];
  const colors = ["#3178c6", "#f1e05a", "#e34c26", "#563d7c", "#89e051", "#00ADD8"];

  // Calculate pie chart
  const total = languages.reduce((sum, [, pct]) => sum + pct, 0);
  let currentAngle = 0;
  const radius = 85;
  const centerX = 160;
  const centerY = 160;

  const pieSlices = languages.map(([lang, pct], idx) => {
    const angle = (pct / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      lang,
      pct,
      color: colors[idx % colors.length],
      path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return `
    <svg width="500" height="320" viewBox="-10 -10 520 340" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <rect width="500" height="320" fill="${bg}" rx="12"/>
      <rect width="500" height="320" fill="${bgSecondary}" fill-opacity="0.3" rx="12"/>
      
      <!-- Header -->
      <rect width="500" height="50" fill="${bgSecondary}" rx="12"/>
      <text x="250" y="32" fill="url(#titleGrad)" font-size="20" font-weight="700" font-family="system-ui" text-anchor="middle">
        Top Languages
      </text>
      
      <!-- Pie Chart with shadow -->
      <g filter="url(#shadow)">
        ${pieSlices
      .map(
        (slice) => `
          <path d="${slice.path}" fill="${slice.color}" opacity="0.95"/>
        `
      )
      .join("")}
        <circle cx="${centerX}" cy="${centerY}" r="55" fill="${bg}"/>
      </g>
      
      <!-- Center Text -->
      <text x="${centerX}" y="${centerY - 5}" fill="${text}" font-size="14" font-weight="600" font-family="system-ui" text-anchor="middle">
        ${languages.length}
      </text>
      <text x="${centerX}" y="${centerY + 12}" fill="${subtext}" font-size="11" font-family="system-ui" text-anchor="middle">
        Languages
      </text>
      
      <!-- Legend with bars -->
      ${pieSlices
      .map(
        (slice, idx) => `
        <g transform="translate(330, ${70 + idx * 40})">
          <rect width="24" height="24" fill="${slice.color}" rx="6" opacity="0.9"/>
          <text x="34" y="17" fill="${text}" font-size="15" font-weight="500" font-family="system-ui">
            ${escapeXml(slice.lang)}
          </text>
          <rect x="34" y="22" width="${slice.pct * 1.2}" height="4" fill="${slice.color}" opacity="0.6" rx="2"/>
          <text x="155" y="17" fill="${accent}" font-size="14" font-weight="600" font-family="system-ui" text-anchor="end">
            ${slice.pct.toFixed(1)}%
          </text>
        </g>
      `
      )
      .join("")}
      
      <text x="250" y="308" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="middle" opacity="0.7">
        powered by en-git
      </text>
    </svg>
  `;
}

// Contribution Activity Widget (600x250) - NEW
async function generateYearlyContributionWidget(username, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const bgSecondary = isDark ? "#161b22" : "#f6f8fa";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#58a6ff" : "#0969da");

  // Get or generate cache data
  const insights = await getOrGenerateWidgetCache(username);

  if (!insights || !insights.weekly) {
    console.log(`❌ No weekly data available for ${username}`);
    return generateNotFoundSvg(username, theme);
  }

  // Weekly data format: [["2025-W44", 100], ["2025-W43", 50], ...]
  const weeklyRaw = insights.weekly || [];

  // Take up to 12 weeks of actual data, reverse to show oldest to newest (left to right)
  const weeks = weeklyRaw.slice(0, 12).reverse();

  // If less than 2 weeks, show message
  if (weeks.length < 2) {
    return `
      <svg width="800" height="240" viewBox="-10 -10 820 260" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="240" fill="${bg}" rx="12"/>
        <text x="400" y="120" fill="${text}" font-size="16" font-family="system-ui" text-anchor="middle">
          Not enough activity data yet
        </text>
        <text x="400" y="145" fill="${subtext}" font-size="12" font-family="system-ui" text-anchor="middle">
          Keep contributing to see your activity trend!
        </text>
      </svg>
    `;
  }
  const totalContributions = weeks.reduce(
    (sum, week) => sum + (Array.isArray(week) ? week[1] : 0),
    0
  );
  const maxContributions = Math.max(...weeks.map((week) => (Array.isArray(week) ? week[1] : 0)), 1);
  const avgContributions = Math.round(totalContributions / weeks.length);
  const success = customColors.success || (isDark ? "#3fb950" : "#1a7f37");
  const purple = customColors.purple || (isDark ? "#a855f7" : "#9333ea");

  // Create smooth line chart
  const chartWidth = 680;
  const chartHeight = 140;
  const startX = 60;
  const startY = 70;
  const pointSpacing = chartWidth / (weeks.length - 1 || 1);

  // Generate points for the line
  const points = weeks.map((week, idx) => {
    const value = Array.isArray(week) ? week[1] : 0;
    const x = startX + idx * pointSpacing;
    const y = startY + chartHeight - (value / maxContributions) * chartHeight;
    return { x, y, value };
  });

  // Create smooth curve path using quadratic bezier curves
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    pathData += ` Q ${current.x} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
    pathData += ` Q ${next.x} ${next.y}, ${next.x} ${next.y}`;
  }

  // Create area fill path
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${startY + chartHeight} L ${startX} ${startY + chartHeight} Z`;

  return `
    <svg width="800" height="240" viewBox="-10 -10 820 260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accent}" />
          <stop offset="50%" style="stop-color:${purple}" />
          <stop offset="100%" style="stop-color:${success}" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.05" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="800" height="240" fill="${bg}" rx="12"/>
      <rect width="800" height="240" fill="${bgSecondary}" fill-opacity="0.2" rx="12"/>
      
      <!-- Header -->
      <text x="400" y="30" fill="url(#lineGrad)" font-size="20" font-weight="700" font-family="system-ui" text-anchor="middle">
        Activity Trend
      </text>
      <text x="400" y="50" fill="${subtext}" font-size="12" font-family="system-ui" text-anchor="middle">
        ${totalContributions} contributions • ${avgContributions} avg/week
      </text>
      
      <!-- Grid lines -->
      ${[0, 1, 2, 3, 4]
      .map((i) => {
        const y = startY + (i * chartHeight) / 4;
        return `<line x1="${startX}" y1="${y}" x2="${startX + chartWidth}" y2="${y}" stroke="${border}" stroke-width="1" opacity="0.2" stroke-dasharray="5,5"/>`;
      })
      .join("")}
      
      <!-- Area fill -->
      <path d="${areaPath}" fill="url(#areaGrad)"/>
      
      <!-- Line -->
      <path d="${pathData}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
      
      <!-- Data points -->
      ${points
      .map(
        (point, idx) => `
        <circle cx="${point.x}" cy="${point.y}" r="5" fill="${bg}" stroke="url(#lineGrad)" stroke-width="3" filter="url(#glow)">
          <title>Week ${idx + 1}: ${point.value} contributions</title>
        </circle>
      `
      )
      .join("")}
      
      <!-- Week labels -->
      ${points
      .map((point, idx) => {
        if (idx % 2 === 0 || weeks.length <= 6) {
          return `<text x="${point.x}" y="${startY + chartHeight + 20}" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="middle">W${idx + 1}</text>`;
        }
        return "";
      })
      .join("")}
      
      <!-- Y-axis labels -->
      <text x="${startX - 10}" y="${startY + 5}" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="end">
        ${maxContributions}
      </text>
      <text x="${startX - 10}" y="${startY + chartHeight / 2 + 5}" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="end">
        ${Math.round(maxContributions / 2)}
      </text>
      <text x="${startX - 10}" y="${startY + chartHeight + 5}" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="end">
        0
      </text>
      
      <text x="400" y="235" fill="${subtext}" font-size="9" font-family="system-ui" text-anchor="middle" opacity="0.7">
        powered by en-git
      </text>
    </svg>
  `;
}

// Commit Activity by Hour Widget (700x280) - NEW
async function generateCommitTimesWidget(username, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const bgSecondary = isDark ? "#161b22" : "#f6f8fa";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#a855f7" : "#9333ea");

  // Get or generate cache data
  const insights = await getOrGenerateWidgetCache(username);

  if (!insights || !insights.commitTimes) {
    console.log(`❌ No commitTimes data available for ${username}`);
    return generateNotFoundSvg(username, theme);
  }

  const commitTimes = insights.commitTimes || {};
  const profile = commitTimes.profile || "balanced";

  // Convert hourly data to array (0-23 hours)
  const hourlyData = [];
  const hoursArray = commitTimes.hours || [];
  for (let i = 0; i < 24; i++) {
    hourlyData.push({
      hour: i,
      commits: hoursArray[i] || 0,
    });
  }

  const maxCommits = Math.max(...hourlyData.map((d) => d.commits), 1);

  return `
    <svg width="700" height="280" viewBox="-10 -10 720 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="commitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:0.8" />
          <stop offset="50%" style="stop-color:#ec4899;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.8" />
        </linearGradient>
        <filter id="barGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="700" height="280" fill="${bg}" rx="12"/>
      <rect width="700" height="280" fill="${bgSecondary}" fill-opacity="0.3" rx="12"/>
      
      <!-- Header -->
      <rect width="700" height="60" fill="${bgSecondary}" rx="12"/>
      <text x="350" y="28" fill="url(#commitGrad)" font-size="20" font-weight="700" font-family="system-ui" text-anchor="middle">
        Commit Activity by Hour (UTC)
      </text>
      <text x="350" y="48" fill="${subtext}" font-size="13" font-family="system-ui" text-anchor="middle">
        You're a <tspan fill="${accent}" font-weight="600">${profile}</tspan> coder
      </text>
      
      <!-- Grid lines -->
      ${[0, 1, 2, 3, 4]
      .map((i) => {
        const y = 80 + i * 40;
        return `<line x1="40" y1="${y}" x2="660" y2="${y}" stroke="${border}" stroke-width="1" opacity="0.3" stroke-dasharray="5,5"/>`;
      })
      .join("")}
      
      <!-- Bars -->
      ${hourlyData
      .map((data, idx) => {
        const height = Math.max((data.commits / maxCommits) * 140, 2);
        const x = 45 + idx * 26;
        const y = 240 - height;
        const barWidth = 22;

        return `
          <g filter="url(#barGlow)">
            <rect x="${x}" y="${y}" width="${barWidth}" height="${height}" fill="url(#commitGrad)" rx="3" opacity="0.85"/>
          </g>
          ${idx % 3 === 0
            ? `
            <text x="${x + barWidth / 2}" y="260" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="middle">
              ${data.hour}:00
            </text>
          `
            : ""
          }
        `;
      })
      .join("")}
      
      <!-- Y-axis labels -->
      <text x="30" y="85" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="end">
        ${maxCommits}
      </text>
      <text x="30" y="165" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="end">
        ${Math.round(maxCommits / 2)}
      </text>
      <text x="30" y="245" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="end">
        0
      </text>
      
      <text x="350" y="275" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="middle" opacity="0.7">
        powered by en-git
      </text>
    </svg>
  `;
}

// Skills/Domain Widget (600x400) - Radar Chart
async function generateSkillsWidget(username, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const bgSecondary = isDark ? "#161b22" : "#f6f8fa";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#58a6ff" : "#0969da");
  const success = customColors.success || (isDark ? "#3fb950" : "#1a7f37");

  // Get or generate cache data
  const insights = await getOrGenerateWidgetCache(username);

  if (!insights || !insights.domain) {
    return generateNotFoundSvg(username, theme);
  }

  const domainData = insights.domain;
  const primaryDomain = domainData.domain;
  const scores = domainData.scores;

  // Top 6 domains for radar chart
  const topDomains = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Radar chart setup
  const centerX = 300;
  const centerY = 260; // Moved down significantly for more top padding
  const maxRadius = 120; // Reduced to fit better with more top space
  const levels = 5;

  // Calculate points for radar
  const angleStep = (Math.PI * 2) / topDomains.length;
  const maxScore = Math.max(...topDomains.map(([, score]) => score), 10);

  const radarPoints = topDomains.map(([domain, score], idx) => {
    const angle = idx * angleStep - Math.PI / 2;
    const radius = (score / maxScore) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y, domain, score, angle };
  });

  // Create polygon path
  const polygonPath =
    radarPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Grid circles
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * maxRadius;
    return `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="${border}" stroke-width="1" opacity="0.3"/>`;
  }).join("");

  // Grid lines
  const gridLines = radarPoints
    .map((p) => {
      const endX = centerX + maxRadius * Math.cos(p.angle);
      const endY = centerY + maxRadius * Math.sin(p.angle);
      return `<line x1="${centerX}" y1="${centerY}" x2="${endX}" y2="${endY}" stroke="${border}" stroke-width="1" opacity="0.3"/>`;
    })
    .join("");

  // Labels
  const labels = radarPoints
    .map((p) => {
      const labelRadius = maxRadius + 40;
      const labelX = centerX + labelRadius * Math.cos(p.angle);
      const labelY = centerY + labelRadius * Math.sin(p.angle);
      const shortName = p.domain.split("/")[0].split(" ")[0];
      return `
      <text x="${labelX}" y="${labelY}" fill="${text}" font-size="12" font-weight="500" font-family="system-ui" text-anchor="middle">
        ${escapeXml(shortName)}
      </text>
      <text x="${labelX}" y="${labelY + 15}" fill="${accent}" font-size="14" font-weight="700" font-family="system-ui" text-anchor="middle">
        ${p.score.toFixed(1)}
      </text>
    `;
    })
    .join("");

  return `
    <svg width="600" height="400" viewBox="-10 -10 620 420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:${success};stop-opacity:0.4" />
        </linearGradient>
        <filter id="skillGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="600" height="400" fill="${bg}" rx="12"/>
      <rect width="600" height="400" fill="${bgSecondary}" fill-opacity="0.2" rx="12"/>
      
      <!-- Header -->
      <text x="300" y="35" fill="${text}" font-size="22" font-weight="700" font-family="system-ui" text-anchor="middle">
        Skill Profile
      </text>
      <text x="300" y="60" fill="${accent}" font-size="16" font-weight="600" font-family="system-ui" text-anchor="middle">
        Primary: ${escapeXml(primaryDomain)}
      </text>
      
      <!-- Radar Chart -->
      ${gridCircles}
      ${gridLines}
      
      <!-- Data polygon -->
      <path d="${polygonPath}" fill="url(#skillGrad)" stroke="${accent}" stroke-width="2" filter="url(#skillGlow)"/>
      
      <!-- Data points -->
      ${radarPoints
      .map(
        (p) => `
        <circle cx="${p.x}" cy="${p.y}" r="6" fill="${bg}" stroke="${accent}" stroke-width="3" filter="url(#skillGlow)">
          <title>${p.domain}: ${p.score.toFixed(1)}</title>
        </circle>
      `
      )
      .join("")}
      
      <!-- Labels -->
      ${labels}
      
      <text x="300" y="390" fill="${subtext}" font-size="9" font-family="system-ui" text-anchor="middle" opacity="0.7">
        powered by en-git
      </text>
    </svg>
  `;
}

// Profile Score Widget (500x280) - Score Breakdown
async function generateScoreWidget(username, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const bgSecondary = isDark ? "#161b22" : "#f6f8fa";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#58a6ff" : "#0969da");
  const success = customColors.success || (isDark ? "#3fb950" : "#1a7f37");
  const purple = customColors.purple || (isDark ? "#a855f7" : "#9333ea");

  // Get or generate cache data
  const insights = await getOrGenerateWidgetCache(username);

  if (!insights || !insights.profileScore) {
    return generateNotFoundSvg(username, theme);
  }

  const scoreData = insights.profileScore;
  const totalScore = scoreData.score || 0;
  const grade = scoreData.grade || "N/A";

  // Score breakdown (mock data - you can calculate these from actual metrics)
  const breakdown = [
    { label: "Profile Completeness", value: Math.min(100, totalScore * 0.5), color: accent },
    { label: "Repository Quality", value: Math.min(100, totalScore * 0.63), color: success },
    { label: "Skills & Diversity", value: Math.min(100, totalScore * 1.0), color: purple },
    { label: "Community Engagement", value: Math.min(100, totalScore * 0.1), color: "#d29922" },
    { label: "Activity & Consistency", value: Math.min(100, totalScore * 1.0), color: accent },
  ];

  const barHeight = 22;
  const barSpacing = 48;
  const startY = 190; // More top padding with larger widget
  const barWidth = 480; // Wider bars for larger widget
  const startX = 60; // More left padding

  return `
    <svg width="600" height="420" viewBox="-10 -10 620 440" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accent}" />
          <stop offset="100%" style="stop-color:${purple}" />
        </linearGradient>
        <filter id="barGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="600" height="420" fill="${bg}" rx="12"/>
      <rect width="600" height="420" fill="${bgSecondary}" fill-opacity="0.3" rx="12"/>
      
      <!-- Header -->
      <text x="50" y="40" fill="${text}" font-size="20" font-weight="700" font-family="system-ui">
        Profile Score
      </text>
      <text x="50" y="60" fill="${subtext}" font-size="12" font-family="system-ui">
        Your GitHub profile strength
      </text>
      
      <!-- Large Score Display -->
      <text x="540" y="75" fill="url(#scoreGrad)" font-size="52" font-weight="700" font-family="system-ui" text-anchor="end">
        ${totalScore}
      </text>
      <text x="540" y="95" fill="${subtext}" font-size="14" font-family="system-ui" text-anchor="end">
        out of 100
      </text>
      
      <!-- Grade Badge -->
      <g transform="translate(50, 80)">
        <rect width="120" height="40" fill="${purple}" fill-opacity="0.2" rx="8" stroke="${purple}" stroke-width="2"/>
        <text x="60" y="27" fill="${purple}" font-size="18" font-weight="700" font-family="system-ui" text-anchor="middle">
          Grade ${escapeXml(grade)}
        </text>
      </g>
      
      <!-- Score Breakdown Title -->
      <text x="50" y="145" fill="${text}" font-size="14" font-weight="600" font-family="system-ui">
        Score Breakdown
      </text>
      
      <!-- Breakdown Bars -->
      ${breakdown
      .map((item, idx) => {
        const y = startY + idx * barSpacing;
        const fillWidth = (item.value / 100) * barWidth;

        return `
          <g>
            <!-- Background bar -->
            <rect x="${startX}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${border}" opacity="0.3" rx="10"/>
            
            <!-- Filled bar -->
            <rect x="${startX}" y="${y}" width="${fillWidth}" height="${barHeight}" fill="${item.color}" opacity="0.8" rx="10" filter="url(#barGlow)"/>
            
            <!-- Label -->
            <text x="${startX}" y="${y - 5}" fill="${text}" font-size="11" font-weight="500" font-family="system-ui">
              ${escapeXml(item.label)}
            </text>
            
            <!-- Percentage -->
            <text x="${startX + barWidth + 10}" y="${y + 15}" fill="${item.color}" font-size="12" font-weight="700" font-family="system-ui">
              ${Math.round(item.value)}%
            </text>
          </g>
        `;
      })
      .join("")}
      
      <text x="300" y="410" fill="${subtext}" font-size="9" font-family="system-ui" text-anchor="middle" opacity="0.7">
        powered by en-git
      </text>
    </svg>
  `;
}

// Repository Health Score Widget (600×420)
async function generateRepoWidget(repoPath, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const bgSecondary = isDark ? "#161b22" : "#f6f8fa";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#58a6ff" : "#0969da");
  const success = customColors.success || (isDark ? "#3fb950" : "#1a7f37");
  const purple = customColors.purple || (isDark ? "#a855f7" : "#9333ea");

  // Parse owner/repo from path
  const [owner, repo] = repoPath.split("/");

  if (!owner || !repo) {
    return `
      <svg width="700" height="550" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="550" fill="${bg}" rx="12"/>
        <text x="350" y="275" fill="${text}" font-size="14" font-family="system-ui" text-anchor="middle">
          Invalid format. Use: owner/repo
        </text>
      </svg>
    `;
  }

  try {
    // Fetch repository data from GitHub API
    const axios = (await import("axios")).default;
    const token = process.env.GITHUB_TOKEN;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch all required data in parallel
    const [repoRes, issuesRes, prsRes, commitsRes] = await Promise.all([
      axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      axios
        .get(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`, {
          headers,
        })
        .catch(() => ({ data: [] })),
      axios
        .get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`, {
          headers,
        })
        .catch(() => ({ data: [] })),
      axios
        .get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, { headers })
        .catch(() => ({ data: [] })),
    ]);

    const repository = repoRes.data;
    const issues = issuesRes.data;
    const prs = prsRes.data;
    const commits = commitsRes.data;

    // EXACT same calculation as repository.controller.js
    let totalScore = 0;
    const breakdown = [];

    // Has description (10 points)
    if (repository.description) {
      totalScore += 10;
      breakdown.push({ label: "Has description", value: 100, points: "+10", color: accent });
    }

    // Has license (10 points)
    if (repository.license) {
      totalScore += 10;
      breakdown.push({ label: "Has license", value: 100, points: "+10", color: success });
    }

    // Recent activity (20 points)
    const daysSinceUpdate = (Date.now() - new Date(repository.pushed_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) {
      totalScore += 20;
      breakdown.push({ label: "Updated in last week", value: 100, points: "+20", color: purple });
    } else if (daysSinceUpdate < 30) {
      totalScore += 15;
      breakdown.push({ label: "Updated in last month", value: 75, points: "+15", color: purple });
    } else if (daysSinceUpdate < 90) {
      totalScore += 10;
      breakdown.push({
        label: "Updated in last 3 months",
        value: 50,
        points: "+10",
        color: purple,
      });
    }

    // Has topics (10 points)
    if (repository.topics && repository.topics.length > 0) {
      totalScore += 10;
      breakdown.push({
        label: `Has ${repository.topics.length} topics`,
        value: 100,
        points: "+10",
        color: "#d29922",
      });
    }

    // Issue management (20 points)
    const actualIssues = issues.filter((i) => !i.pull_request);
    if (actualIssues.length > 0) {
      const closedIssues = actualIssues.filter((i) => i.state === "closed");
      const closeRate = closedIssues.length / actualIssues.length;
      const issuePoints = Math.round(closeRate * 20);
      totalScore += issuePoints;
      breakdown.push({
        label: `${(closeRate * 100).toFixed(0)}% issue close rate`,
        value: closeRate * 100,
        points: `+${issuePoints}`,
        color: accent,
      });
    }

    // PR management (20 points)
    if (prs.length > 0) {
      const mergedPRs = prs.filter((pr) => pr.merged_at);
      const mergeRate = mergedPRs.length / prs.length;
      const prPoints = Math.round(mergeRate * 20);
      totalScore += prPoints;
      breakdown.push({
        label: `${(mergeRate * 100).toFixed(0)}% PR merge rate`,
        value: mergeRate * 100,
        points: `+${prPoints}`,
        color: success,
      });
    }

    // Commit regularity (10 points)
    if (commits.length >= 50) {
      totalScore += 10;
      breakdown.push({
        label: "Regular commit activity (50+)",
        value: 100,
        points: "+10",
        color: purple,
      });
    } else if (commits.length >= 20) {
      totalScore += 5;
      breakdown.push({
        label: "Moderate commit activity (20+)",
        value: 50,
        points: "+5",
        color: purple,
      });
    }

    const grade =
      totalScore >= 80
        ? "A"
        : totalScore >= 60
          ? "B"
          : totalScore >= 40
            ? "C"
            : totalScore >= 20
              ? "D"
              : "F";

    const barHeight = 18;
    const barSpacing = 50;
    const startY = 200;
    const barWidth = 580;
    const startX = 60;

    return `
      <svg width="700" height="550" viewBox="-10 -10 720 570" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="repoScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${accent}" />
            <stop offset="100%" style="stop-color:${purple}" />
          </linearGradient>
          <filter id="repoBarGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect width="700" height="550" fill="${bg}" rx="12"/>
        <rect width="700" height="550" fill="${bgSecondary}" fill-opacity="0.3" rx="12"/>
        
        <!-- Header -->
        <text x="50" y="40" fill="${text}" font-size="20" font-weight="700" font-family="system-ui">
          Repository Health
        </text>
        <text x="50" y="60" fill="${subtext}" font-size="12" font-family="system-ui">
          ${escapeXml(repository.name)}
        </text>
        
        <!-- Large Score Display -->
        <text x="640" y="75" fill="url(#repoScoreGrad)" font-size="52" font-weight="700" font-family="system-ui" text-anchor="end">
          ${totalScore}
        </text>
        <text x="640" y="95" fill="${subtext}" font-size="14" font-family="system-ui" text-anchor="end">
          out of 100
        </text>
        
        <!-- Grade Badge -->
        <g transform="translate(50, 80)">
          <rect width="120" height="40" fill="${purple}" fill-opacity="0.2" rx="8" stroke="${purple}" stroke-width="2"/>
          <text x="60" y="27" fill="${purple}" font-size="18" font-weight="700" font-family="system-ui" text-anchor="middle">
            Grade ${escapeXml(grade)}
          </text>
        </g>
        
        <!-- Score Breakdown Title -->
        <text x="50" y="145" fill="${text}" font-size="14" font-weight="600" font-family="system-ui">
          Score Breakdown
        </text>
        
        <!-- Breakdown Bars -->
        ${breakdown
        .map((item, idx) => {
          const y = startY + idx * barSpacing;
          const fillWidth = (item.value / 100) * barWidth;

          return `
            <g>
              <!-- Background bar -->
              <rect x="${startX}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${border}" opacity="0.3" rx="10"/>
              
              <!-- Filled bar -->
              <rect x="${startX}" y="${y}" width="${fillWidth}" height="${barHeight}" fill="${item.color}" opacity="0.8" rx="10" filter="url(#repoBarGlow)"/>
              
              <!-- Label -->
              <text x="${startX}" y="${y - 5}" fill="${text}" font-size="11" font-weight="500" font-family="system-ui">
                ${escapeXml(item.label)}
              </text>
              
              <!-- Points -->
              <text x="${startX + barWidth + 10}" y="${y + 15}" fill="${item.color}" font-size="12" font-weight="700" font-family="system-ui">
                ${item.points || ""}
              </text>
            </g>
          `;
        })
        .join("")}
        
        <text x="350" y="540" fill="${subtext}" font-size="9" font-family="system-ui" text-anchor="middle" opacity="0.7">
          powered by en-git
        </text>
      </svg>
    `;
  } catch (error) {
    console.error(`Error fetching repo ${repoPath}:`, error.message);
    return `
      <svg width="700" height="550" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="550" fill="${bg}" rx="12"/>
        <text x="350" y="275" fill="${text}" font-size="16" font-weight="600" font-family="system-ui" text-anchor="middle">
          Repository not found
        </text>
        <text x="350" y="300" fill="${subtext}" font-size="12" font-family="system-ui" text-anchor="middle">
          ${escapeXml(repoPath)}
        </text>
      </svg>
    `;
  }
}

// Repository Contributors Widget (600×400) - Shows commit percentage breakdown
async function generateContributorsWidget(repoPath, theme, customColors = {}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const bgSecondary = isDark ? "#161b22" : "#f6f8fa";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = customColors.accent || (isDark ? "#58a6ff" : "#0969da");
  const success = customColors.success || (isDark ? "#3fb950" : "#1a7f37");
  const purple = customColors.purple || (isDark ? "#a855f7" : "#9333ea");

  const [owner, repo] = repoPath.split("/");

  if (!owner || !repo) {
    return `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="${bg}" rx="12"/>
        <text x="300" y="200" fill="${text}" font-size="14" font-family="system-ui" text-anchor="middle">
          Invalid format. Use: owner/repo
        </text>
      </svg>
    `;
  }

  try {
    const axios = (await import("axios")).default;
    const token = process.env.GITHUB_TOKEN;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch repository info and contributors (fetch up to 100 to get accurate count)
    const [repoRes, contributorsRes] = await Promise.all([
      axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, {
        headers,
      }),
    ]);

    const repository = repoRes.data;
    const contributors = contributorsRes.data;

    // Calculate total contributions
    const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);

    // Get top 5 contributors
    const top5 = contributors.slice(0, 5);
    const others = contributors.slice(5);

    // Calculate "Others" contribution
    const othersContributions = others.reduce((sum, c) => sum + c.contributions, 0);

    // Build contributors list with top 5 + Others
    const topContributors = [
      ...top5.map((c, idx) => ({
        username: c.login,
        contributions: c.contributions,
        percentage: ((c.contributions / totalContributions) * 100).toFixed(1),
        color: [accent, success, purple, "#d29922", "#ec4899"][idx],
      })),
      ...(othersContributions > 0
        ? [
            {
              username: "Others",
              contributions: othersContributions,
              percentage: ((othersContributions / totalContributions) * 100).toFixed(1),
              color: "#6b7280",
            },
          ]
        : []),
    ];

    // Pie chart setup
    const centerX = 200;
    const centerY = 280;
    const radius = 120;

    // Calculate pie slices
    let currentAngle = 0;
    const pieSlices = topContributors.map((contributor) => {
      const percentage = parseFloat(contributor.percentage);
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      return {
        ...contributor,
        path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      };
    });

    return `
      <svg width="650" height="550" viewBox="-10 -10 670 570" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="contribGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${accent}" />
            <stop offset="100%" style="stop-color:${purple}" />
          </linearGradient>
          <filter id="pieGlow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <rect width="650" height="550" fill="${bg}" rx="12"/>
        <rect width="650" height="550" fill="${bgSecondary}" fill-opacity="0.2" rx="12"/>
        
        <!-- Header -->
        <text x="325" y="40" fill="url(#contribGrad)" font-size="22" font-weight="700" font-family="system-ui" text-anchor="middle">
          Top Contributors
        </text>
        <text x="325" y="65" fill="${text}" font-size="14" font-weight="600" font-family="system-ui" text-anchor="middle">
          ${escapeXml(repository.name)}
        </text>
        <text x="325" y="88" fill="${subtext}" font-size="12" font-family="system-ui" text-anchor="middle">
          ${totalContributions.toLocaleString()} total commits
        </text>
        
        <!-- Pie Chart -->
        <g filter="url(#pieGlow)">
          ${pieSlices
            .map(
              (slice) => `
            <path d="${slice.path}" fill="${slice.color}" opacity="0.9" stroke="${bg}" stroke-width="2">
              <title>${slice.username}: ${slice.contributions} commits (${slice.percentage}%)</title>
            </path>
          `
            )
            .join("")}
        </g>
        
        <!-- Center circle -->
        <circle cx="${centerX}" cy="${centerY}" r="50" fill="${bg}" stroke="${border}" stroke-width="2"/>
        <text x="${centerX}" y="${centerY - 8}" fill="${text}" font-size="16" font-weight="700" font-family="system-ui" text-anchor="middle">
          ${contributors.length}
        </text>
        <text x="${centerX}" y="${centerY + 10}" fill="${subtext}" font-size="11" font-family="system-ui" text-anchor="middle">
          Contributors
        </text>
        
        <!-- Legend -->
        ${topContributors
          .map((contributor, idx) => {
            const legendY = 140 + idx * 45;
            // Truncate username if longer than 12 characters
            const displayName =
              contributor.username.length > 12
                ? contributor.username.substring(0, 12) + "..."
                : contributor.username;
            return `
            <g>
              <!-- Color box -->
              <rect x="430" y="${legendY}" width="20" height="20" fill="${contributor.color}" rx="4" opacity="0.9"/>
              
              <!-- Username -->
              <text x="460" y="${legendY + 14}" fill="${text}" font-size="13" font-weight="500" font-family="system-ui">
                ${escapeXml(displayName)}
              </text>
              
              <!-- Stats -->
              <text x="600" y="${legendY + 14}" fill="${contributor.color}" font-size="12" font-weight="700" font-family="system-ui" text-anchor="end">
                ${contributor.percentage}%
              </text>
            </g>
          `;
          })
          .join("")}
        
        
        <text x="325" y="535" fill="${subtext}" font-size="9" font-family="system-ui" text-anchor="middle" opacity="0.7">
          powered by en-git
        </text>
      </svg>
    `;
  } catch (error) {
    console.error(`Error fetching contributors for ${repoPath}:`, error.message);
    return `
      <svg width="650" height="550" xmlns="http://www.w3.org/2000/svg">
        <rect width="650" height="550" fill="${bg}" rx="12"/>
        <text x="325" y="275" fill="${text}" font-size="16" font-weight="600" font-family="system-ui" text-anchor="middle">
          Repository not found
        </text>
        <text x="325" y="300" fill="${subtext}" font-size="12" font-family="system-ui" text-anchor="middle">
          ${escapeXml(repoPath)}
        </text>
      </svg>
    `;
  }
}
