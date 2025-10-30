import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import Leaderboard from "../models/leaderboard.model.js";

// Generate SVG widget
export const generateWidget = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { type = "card", theme = "dark" } = req.query;

  // Fetch user data from leaderboard
  const userData = await Leaderboard.findOne({ username }).lean();

  if (!userData) {
    // Return a "not found" SVG instead of error
    const notFoundSvg = generateNotFoundSvg(username, theme);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
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
      svg = generateCardWidget(userData, theme);
      break;
    case "stats":
      svg = generateStatsWidget(userData, theme);
      break;
    case "badge":
      svg = generateBadgeWidget(userData, theme);
      break;
    case "rank":
      svg = generateRankWidget(userData, theme);
      break;
    case "full":
      svg = generateFullWidget(userData, theme);
      break;
    case "compact":
      svg = generateCompactWidget(userData, theme);
      break;
    default:
      svg = generateCardWidget(userData, theme);
  }

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=1800"); // Cache for 30 minutes
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins for widgets
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.send(svg);
});

// Card Widget (300x180)
function generateCardWidget(user, theme) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = isDark ? "#58a6ff" : "#0969da";

  // Use a placeholder circle with initials instead of avatar to avoid CORS
  const initial = (user.name || user.username).charAt(0).toUpperCase();

  return `
    <svg width="300" height="180" xmlns="http://www.w3.org/2000/svg">
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
      ${
        user.topLanguage
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

// Stats Widget (400x120)
function generateStatsWidget(user, theme) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = isDark ? "#58a6ff" : "#0969da";

  return `
    <svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
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
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
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
    <svg width="250" height="100" xmlns="http://www.w3.org/2000/svg">
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

  return `
    <svg width="300" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="180" fill="${bg}" stroke="${border}" stroke-width="1" rx="6"/>
      
      <text x="150" y="80" fill="${text}" font-size="16" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        @${escapeXml(username)}
      </text>
      
      <text x="150" y="105" fill="${subtext}" font-size="12" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        Not analyzed yet
      </text>
      
      <text x="150" y="130" fill="${subtext}" font-size="10" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
        Visit en-git.vercel.app to analyze
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
function generateFullWidget(user, theme) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = isDark ? "#58a6ff" : "#0969da";
  const success = isDark ? "#3fb950" : "#1a7f37";
  const warning = isDark ? "#d29922" : "#9a6700";

  const initial = (user.name || user.username).charAt(0).toUpperCase();

  return `
    <svg width="495" height="195" xmlns="http://www.w3.org/2000/svg">
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
          🏆 Rank #${user.rank || "N/A"}
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
      ${
        user.topLanguage
          ? `<g transform="translate(20, 170)">
        <rect width="120" height="20" fill="${accent}" fill-opacity="0.1" rx="10"/>
        <text x="60" y="14" fill="${accent}" font-size="11" font-weight="600" font-family="system-ui" text-anchor="middle">
          ⚡ ${escapeXml(user.topLanguage)}
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
    <svg width="350" height="100" xmlns="http://www.w3.org/2000/svg">
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
        ${
          user.topLanguage
            ? `<text x="0" y="40" fill="${accent}" font-size="10" font-family="system-ui">
          ⚡ ${escapeXml(user.topLanguage)}
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
