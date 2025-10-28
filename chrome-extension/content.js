// Content script that runs on GitHub pages
console.log("en-git content script loaded");

// Helper function to check if extension context is valid
function isExtensionContextValid() {
  try {
    return chrome.runtime && chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

// Global error handler for extension context invalidation
window.addEventListener("error", (event) => {
  if (
    event.message &&
    event.message.includes("Extension context invalidated")
  ) {
    console.log("en-git: Extension was reloaded. Please refresh the page.");
    event.preventDefault();
  }
});

// ==================== CODE QUALITY ANALYZER (Inline) ====================
// Inlined to avoid ES6 module import issues in content scripts

class CodeQualityAnalyzer {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async analyzeFile(content, fileInfo) {
    const cacheKey = `${fileInfo.path}-${fileInfo.sha || Date.now()}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const metrics = {
      qualityScore: this.calculateQualityScore(content, fileInfo),
      complexity: this.calculateComplexity(content, fileInfo),
      linesOfCode: this.countLines(content),
      issues: this.findIssues(content, fileInfo),
      suggestions: this.generateSuggestions(content, fileInfo),
      breakdown: this.getScoreBreakdown(content, fileInfo),
    };

    this.cache.set(cacheKey, {
      data: metrics,
      timestamp: Date.now(),
    });

    return metrics;
  }

  calculateQualityScore(content, fileInfo) {
    let score = 100;
    const lines = content.split("\n");
    const ext = fileInfo.extension?.toLowerCase();

    if (lines.length > 500) score -= 10;
    else if (lines.length > 300) score -= 5;

    const longLines = lines.filter((line) => line.length > 120).length;
    score -= Math.min(longLines * 2, 15);

    const commentLines = this.countCommentLines(content, ext);
    const commentRatio = commentLines / lines.length;
    if (commentRatio < 0.05) score -= 15;
    else if (commentRatio > 0.4) score -= 5;

    const longFunctions = this.findLongFunctions(content, ext);
    score -= Math.min(longFunctions.length * 5, 20);

    const deepNesting = this.findDeepNesting(content);
    score -= Math.min(deepNesting * 10, 20);

    const todoCount = (content.match(/TODO|FIXME|HACK|XXX/gi) || []).length;
    score -= Math.min(todoCount * 5, 15);

    const debugStatements = this.countDebugStatements(content, ext);
    score -= Math.min(debugStatements * 3, 10);

    const magicNumbers = this.findMagicNumbers(content, ext);
    score -= Math.min(magicNumbers * 2, 10);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateComplexity(content, fileInfo) {
    let complexity = 0;

    const patterns = {
      if: /\bif\s*\(/g,
      else: /\belse\b/g,
      for: /\bfor\s*\(/g,
      while: /\bwhile\s*\(/g,
      switch: /\bswitch\s*\(/g,
      case: /\bcase\s+/g,
      catch: /\bcatch\s*\(/g,
      ternary: /\?[^:]+:/g,
      logicalAnd: /&&/g,
      logicalOr: /\|\|/g,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    if (complexity < 10) return "Low";
    if (complexity < 25) return "Medium";
    return "High";
  }

  countLines(content) {
    const lines = content.split("\n");
    return lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*") &&
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("#")
      );
    }).length;
  }

  countCommentLines(content, ext) {
    const lines = content.split("\n");
    let commentLines = 0;
    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.includes("/*")) inBlockComment = true;
      if (inBlockComment) {
        commentLines++;
        if (trimmed.includes("*/")) inBlockComment = false;
        continue;
      }

      if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
        commentLines++;
      }
    }

    return commentLines;
  }

  findLongFunctions(content, ext) {
    const longFunctions = [];
    const lines = content.split("\n");
    let inFunction = false;
    let functionStart = 0;
    let functionName = "";
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/.test(line)) {
        inFunction = true;
        functionStart = i;
        const match = line.match(/function\s+(\w+)|const\s+(\w+)/);
        functionName = match ? match[1] || match[2] : "anonymous";
        braceCount =
          (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      } else if (inFunction) {
        braceCount +=
          (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

        if (braceCount === 0) {
          const functionLength = i - functionStart + 1;
          if (functionLength > 50) {
            longFunctions.push({
              name: functionName,
              length: functionLength,
              line: functionStart + 1,
            });
          }
          inFunction = false;
        }
      }
    }

    return longFunctions;
  }

  findDeepNesting(content) {
    const lines = content.split("\n");
    let currentNesting = 0;
    let deepNestingCount = 0;

    for (const line of lines) {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;

      currentNesting += openBraces - closeBraces;

      if (currentNesting > 3) {
        deepNestingCount++;
      }
    }

    return deepNestingCount;
  }

  countDebugStatements(content, ext) {
    const patterns = [
      /console\.(log|debug|info|warn|error)/g,
      /print\s*\(/g,
      /println\s*\(/g,
      /System\.out\.println/g,
      /debugger;/g,
    ];

    let count = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) count += matches.length;
    }

    return count;
  }

  findMagicNumbers(content, ext) {
    const magicNumberPattern = /\b(?!0\b|1\b|2\b|10\b|100\b|1000\b)\d{2,}\b/g;
    const matches = content.match(magicNumberPattern);
    return matches ? matches.length : 0;
  }

  findIssues(content, fileInfo) {
    const issues = [];
    const ext = fileInfo.extension?.toLowerCase();

    const longFunctions = this.findLongFunctions(content, ext);
    longFunctions.forEach((fn) => {
      issues.push({
        type: "warning",
        message: `Function '${fn.name}' is too long (${fn.length} lines)`,
        line: fn.line,
        severity: "medium",
      });
    });

    const commentRatio =
      this.countCommentLines(content, ext) / content.split("\n").length;
    if (commentRatio < 0.05) {
      issues.push({
        type: "warning",
        message: "Low comment ratio - consider adding more documentation",
        severity: "low",
      });
    }

    const debugCount = this.countDebugStatements(content, ext);
    if (debugCount > 0) {
      issues.push({
        type: "warning",
        message: `Found ${debugCount} debug statement(s) - should be removed in production`,
        severity: "medium",
      });
    }

    const todoCount = (content.match(/TODO|FIXME/gi) || []).length;
    if (todoCount > 0) {
      issues.push({
        type: "info",
        message: `Found ${todoCount} TODO/FIXME comment(s)`,
        severity: "low",
      });
    }

    return issues;
  }

  generateSuggestions(content, fileInfo) {
    const suggestions = [];
    const score = this.calculateQualityScore(content, fileInfo);

    if (score < 70) {
      suggestions.push("Consider refactoring to improve code quality");
    }

    const longFunctions = this.findLongFunctions(content, fileInfo.extension);
    if (longFunctions.length > 0) {
      suggestions.push(
        "Break down long functions into smaller, reusable functions"
      );
    }

    const commentRatio =
      this.countCommentLines(content, fileInfo.extension) /
      content.split("\n").length;
    if (commentRatio < 0.1) {
      suggestions.push("Add JSDoc/docstring comments to document functions");
    }

    if (this.countDebugStatements(content, fileInfo.extension) > 0) {
      suggestions.push("Remove console.log/debug statements before production");
    }

    const complexity = this.calculateComplexity(content, fileInfo);
    if (complexity === "High") {
      suggestions.push("Reduce complexity by simplifying control flow");
    }

    if (content.split("\n").length > 300) {
      suggestions.push("Consider splitting this file into smaller modules");
    }

    return suggestions;
  }

  getScoreBreakdown(content, fileInfo) {
    const breakdown = {
      structure: 100,
      documentation: 100,
      complexity: 100,
      bestPractices: 100,
    };

    const lines = content.split("\n").length;
    if (lines > 500) breakdown.structure -= 30;
    else if (lines > 300) breakdown.structure -= 15;

    const longFunctions = this.findLongFunctions(content, fileInfo.extension);
    breakdown.structure -= Math.min(longFunctions.length * 10, 40);

    const commentRatio =
      this.countCommentLines(content, fileInfo.extension) / lines;
    if (commentRatio < 0.05) breakdown.documentation -= 50;
    else if (commentRatio < 0.1) breakdown.documentation -= 30;
    else if (commentRatio < 0.15) breakdown.documentation -= 15;

    const complexityLevel = this.calculateComplexity(content, fileInfo);
    if (complexityLevel === "High") breakdown.complexity -= 40;
    else if (complexityLevel === "Medium") breakdown.complexity -= 20;

    const deepNesting = this.findDeepNesting(content);
    breakdown.complexity -= Math.min(deepNesting * 5, 30);

    const debugCount = this.countDebugStatements(content, fileInfo.extension);
    breakdown.bestPractices -= Math.min(debugCount * 10, 30);

    const magicNumbers = this.findMagicNumbers(content, fileInfo.extension);
    breakdown.bestPractices -= Math.min(magicNumbers * 5, 20);

    const todoCount = (content.match(/TODO|FIXME/gi) || []).length;
    breakdown.bestPractices -= Math.min(todoCount * 5, 20);

    for (const key in breakdown) {
      breakdown[key] = Math.max(0, Math.min(100, breakdown[key]));
    }

    return breakdown;
  }

  clearCache() {
    this.cache.clear();
  }
}

const codeQualityAnalyzer = new CodeQualityAnalyzer();

// ==================== END CODE QUALITY ANALYZER ====================

let settings = null;

// Load settings from storage
chrome.storage.sync.get(["extensionSettings"], (result) => {
  if (result.extensionSettings) {
    settings = result.extensionSettings;
    applySettings(settings);
  }
});

// Listen for settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applySettings") {
    settings = request.settings;
    applySettings(settings);
    sendResponse({ success: true });
    return true;
  }
  return false; // Don't keep channel open if we're not handling the message
});

// Apply custom theme and enhancements
function applySettings(settings) {
  if (!settings) return;

  // Apply custom theme
  if (settings.theme && settings.theme.enabled) {
    applyCustomTheme(settings.theme);
  } else {
    removeCustomTheme();
  }

  // Apply custom font
  if (settings.font && settings.font.enabled) {
    applyCustomFont(settings.font);
  } else {
    removeCustomFont();
  }

  // Apply enhancements
  if (settings.enhancements) {
    if (settings.enhancements.contributionStats) {
      enhanceContributionGraph();
    }
    if (settings.enhancements.repoCards) {
      enhanceRepoCards();
    }
    if (settings.enhancements.enhancedProfile) {
      enhanceProfile();
    }
  }
}

// Apply custom theme colors
function applyCustomTheme(theme) {
  let styleEl = document.getElementById("en-git-custom-theme");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "en-git-custom-theme";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    /* CSS Variables Override */
    :root,
    [data-color-mode="dark"],
    [data-color-mode="light"] {
      --color-accent-fg: ${theme.primaryColor} !important;
      --color-accent-emphasis: ${theme.accentColor} !important;
      --color-canvas-default: ${theme.backgroundColor} !important;
      --color-canvas-subtle: ${theme.backgroundColor} !important;
      --color-fg-default: ${theme.textColor} !important;
      --color-fg-muted: ${theme.textColor}cc !important;
      --color-border-default: ${theme.primaryColor}33 !important;
      --bgColor-default: ${theme.backgroundColor} !important;
      --fgColor-default: ${theme.textColor} !important;
    }
    
    /* Main body background only */
    body {
      background-color: ${theme.backgroundColor} !important;
      color: ${theme.textColor} !important;
    }
    
    /* Main content areas */
    .application-main,
    #js-repo-pjax-container,
    #js-pjax-container,
    .repository-content,
    main[class*="Layout-main"],
    .Layout-main {
      background-color: ${theme.backgroundColor} !important;
    }
    
    /* Header */
    .Header,
    .AppHeader,
    header[role="banner"] {
      background-color: ${theme.backgroundColor} !important;
      border-bottom-color: ${theme.primaryColor}55 !important;
    }
    
    /* Primary buttons only */
    .btn-primary,
    button.btn-primary,
    a.btn-primary {
      background-color: ${theme.accentColor} !important;
      border-color: ${theme.accentColor} !important;
      color: white !important;
    }
    
    .btn-primary:hover,
    .btn-primary:focus {
      background-color: ${theme.primaryColor} !important;
      border-color: ${theme.primaryColor} !important;
    }
    
    /* Links */
    a:not(.btn):not([class*="Button"]) {
      color: ${theme.primaryColor} !important;
    }
    
    a:not(.btn):not([class*="Button"]):hover {
      color: ${theme.accentColor} !important;
    }
    
    /* Content boxes - be selective */
    .Box:not(.color-bg-default):not(.color-bg-subtle),
    .markdown-body,
    .comment-body {
      background-color: ${theme.backgroundColor}f8 !important;
      border-color: ${theme.primaryColor}22 !important;
    }
    
    /* Navigation tabs */
    .UnderlineNav-item[aria-current],
    .UnderlineNav-item.selected {
      border-bottom-color: ${theme.primaryColor} !important;
      color: ${theme.primaryColor} !important;
    }
    
    /* Code viewer */
    .blob-wrapper,
    .blob-code-inner,
    pre,
    code:not(.hljs *) {
      background-color: ${theme.backgroundColor}ee !important;
      color: ${theme.textColor} !important;
    }
    
    /* Forms */
    input[type="text"]:not([class*="color-bg-"]),
    input[type="search"],
    textarea:not([class*="color-bg-"]) {
      background-color: ${theme.backgroundColor}dd !important;
      color: ${theme.textColor} !important;
      border-color: ${theme.primaryColor}44 !important;
    }
    
    input:focus,
    textarea:focus {
      border-color: ${theme.primaryColor} !important;
      box-shadow: 0 0 0 3px ${theme.primaryColor}33 !important;
    }
    
    /* Dropdowns */
    .SelectMenu-modal,
    .dropdown-menu {
      background-color: ${theme.backgroundColor}f5 !important;
      border-color: ${theme.primaryColor}33 !important;
    }
    
    /* Don't override these - let them keep their natural state */
    .Label,
    .IssueLabel,
    .State,
    [class*="color-bg-"],
    [class*="color-fg-"],
    [data-color-mode] [class*="color-"],
    .avatar,
    img,
    svg {
      /* Preserve original colors for labels, states, and images */
    }
  `;
}

function removeCustomTheme() {
  const styleEl = document.getElementById("en-git-custom-theme");
  if (styleEl) styleEl.remove();
}

// Apply custom font
function applyCustomFont(font) {
  let styleEl = document.getElementById("en-git-custom-font");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "en-git-custom-font";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    .blob-code,
    .blob-code-inner,
    textarea,
    pre,
    code,
    .CodeMirror {
      font-family: ${font.family} !important;
      font-size: ${font.size}px !important;
    }
  `;
}

function removeCustomFont() {
  const styleEl = document.getElementById("en-git-custom-font");
  if (styleEl) styleEl.remove();
}

// Enhance contribution graph with detailed stats
function enhanceContributionGraph() {
  const days = document.querySelectorAll(".ContributionCalendar-day");
  days.forEach((day) => {
    const count = day.getAttribute("data-count");
    const date = day.getAttribute("data-date");
    if (count && date) {
      day.addEventListener("mouseenter", () => {
        day.setAttribute("data-tooltip", `${count} contributions on ${date}`);
      });
    }
  });
}

// Enhance repository cards
function enhanceRepoCards() {
  const repoCards = document.querySelectorAll(
    '[data-hovercard-type="repository"]'
  );
  repoCards.forEach((card) => {
    if (card.querySelector(".en-git-enhanced")) return;

    const badge = document.createElement("span");
    badge.className = "en-git-enhanced";
    badge.style.cssText = `
      display: inline-block;
      padding: 2px 6px;
      background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
      color: white;
      border-radius: 4px;
      font-size: 10px;
      margin-left: 8px;
    `;
    badge.textContent = "✨ Enhanced";
    card.appendChild(badge);
  });
}

// Enhance profile page
function enhanceProfile() {
  const profileStats = document.querySelector(".js-profile-editable-area");
  if (profileStats && !document.querySelector(".en-git-profile-enhancement")) {
    const enhancement = document.createElement("div");
    enhancement.className = "en-git-profile-enhancement";
    enhancement.style.cssText = `
      margin-top: 16px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border-radius: 8px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    `;
    enhancement.innerHTML = `
      <p style="margin: 0; font-size: 12px; color: #0ea5e9; font-weight: 600;">
        ✨ Enhanced by en-git
      </p>
    `;
    profileStats.prepend(enhancement);
  }

  // Add "Deeper Analysis" button below Profile Score badge
  addDeeperAnalysisButtonToProfile();
}

// Add "Deeper Analysis" button on GitHub profile pages
function addDeeperAnalysisButtonToProfile() {
  // Check if we're on a profile page
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)\/?$/);
  if (!match) return;

  const username = match[1];

  // Skip if it's not a user profile
  if (
    ["orgs", "marketplace", "trending", "explore", "settings"].includes(
      username
    )
  )
    return;

  // Find the profile score badge (injected by our extension)
  const profileScoreBadge = document.querySelector('[class*="en-git"]');
  if (!profileScoreBadge) {
    // Retry after a delay
    setTimeout(addDeeperAnalysisButtonToProfile, 2000);
    return;
  }

  // Check if button already exists
  if (document.querySelector(".en-git-profile-deeper-analysis")) return;

  // Create button
  const button = document.createElement("button");
  button.className = "en-git-profile-deeper-analysis";
  button.style.cssText = `
    display: block;
    width: 100%;
    margin-top: 12px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
    Deeper Analysis
  `;

  button.onmouseover = () => {
    button.style.transform = "translateY(-2px)";
  };

  button.onmouseout = () => {
    button.style.transform = "translateY(0)";
  };

  button.onclick = () => {
    if (chrome.runtime?.id) {
      chrome.runtime.sendMessage({
        action: "analyzeProfile",
        username: username,
      });
    } else {
      window.open(`https://en-git.vercel.app/stats/${username}`, "_blank");
    }
  };

  // Find where to insert (below the profile score badge)
  const profileContainer =
    profileScoreBadge.closest("div") || profileScoreBadge.parentElement;
  if (profileContainer) {
    profileContainer.appendChild(button);
    console.log("en-git: Added Deeper Analysis button to profile");
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (!settings || !settings.shortcuts || !settings.shortcuts.enabled) return;

  // Ctrl+K: Quick search
  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    const searchInput = document.querySelector('input[name="q"]');
    if (searchInput) searchInput.focus();
  }

  // Ctrl+Shift+N: New repository
  if (e.ctrlKey && e.shiftKey && e.key === "N") {
    e.preventDefault();
    window.location.href = "https://github.com/new";
  }

  // Ctrl+Shift+I: View issues
  if (e.ctrlKey && e.shiftKey && e.key === "I") {
    e.preventDefault();
    if (window.location.pathname.includes("/")) {
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        window.location.href = `https://github.com/${parts[0]}/${parts[1]}/issues`;
      }
    }
  }

  // Ctrl+Shift+D: Toggle dark mode
  if (e.ctrlKey && e.shiftKey && e.key === "D") {
    e.preventDefault();
    const themeToggle = document.querySelector("[data-color-mode-toggle]");
    if (themeToggle) themeToggle.click();
  }
});

// Function to extract username from GitHub profile page
function getUsernameFromPage() {
  // Check if we're on a user profile page
  const profileLink = document.querySelector(
    'meta[property="profile:username"]'
  );
  if (profileLink) {
    return profileLink.getAttribute("content");
  }

  // Fallback: parse from URL
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)\/?$/);
  return match ? match[1] : null;
}

// Function to extract repo info
function getRepoInfo() {
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}

// Profile Score Calculation (simplified for content script)
function calculateProfileScore(stats) {
  if (!stats || !stats.user) return null;

  const { user, publicRepos, totalStars, topLanguages, followers, following } =
    stats;
  let score = 0;

  // Profile Completeness (20 points)
  if (user.name) score += 5;
  if (user.bio) score += 5;
  if (user.location) score += 3;
  if (user.company) score += 3;
  if (user.blog) score += 2;
  if (user.twitter_username) score += 2;

  // Repository Quality (30 points)
  score += Math.min(10, Math.floor((publicRepos / 10) * 10));
  if (totalStars >= 100) score += 20;
  else if (totalStars >= 50) score += 15;
  else if (totalStars >= 10) score += 10;
  else score += Math.floor((totalStars / 100) * 20);

  // Skills & Diversity (20 points)
  const langCount = topLanguages?.length || 0;
  score += Math.min(20, Math.floor((langCount / 5) * 20));

  // Community Engagement (15 points)
  if (followers >= 100) score += 8;
  else if (followers >= 50) score += 6;
  else if (followers >= 10) score += 4;
  else score += Math.floor((followers / 100) * 8);

  if (following >= 20) score += 4;
  else score += Math.floor((following / 20) * 4);

  const gists = user.public_gists || 0;
  score += Math.min(3, Math.floor((gists / 5) * 3));

  // Activity & Consistency (15 points)
  const accountAge = user.created_at
    ? Math.floor(
        (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 365)
      )
    : 0;
  score += Math.min(5, Math.floor((accountAge / 2) * 5));

  if (publicRepos > 0 && accountAge > 0) {
    const reposPerYear = publicRepos / Math.max(accountAge, 1);
    score += Math.min(10, Math.floor((reposPerYear / 5) * 10));
  }

  // Calculate rating
  let rating = "Beginner";
  let ratingIcon = "🌱";
  let ratingColor = "#f59e0b";

  if (score >= 90) {
    rating = "Elite";
    ratingIcon = "👑";
    ratingColor = "#a855f7";
  } else if (score >= 75) {
    rating = "Expert";
    ratingIcon = "🏆";
    ratingColor = "#3b82f6";
  } else if (score >= 60) {
    rating = "Advanced";
    ratingIcon = "⭐";
    ratingColor = "#10b981";
  } else if (score >= 40) {
    rating = "Intermediate";
    ratingIcon = "📈";
    ratingColor = "#eab308";
  }

  return {
    score: Math.round(score),
    rating,
    ratingIcon,
    ratingColor,
  };
}

// Fetch profile stats and calculate score
async function fetchProfileScore(username) {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
      ),
    ]);

    if (!userRes.ok) return null;

    const userData = await userRes.json();
    const reposData = await reposRes.json();

    const totalStars = reposData.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );
    const languages = {};
    reposData.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    const topLanguages = Object.keys(languages).slice(0, 5);

    return calculateProfileScore({
      user: userData,
      publicRepos: userData.public_repos,
      totalStars,
      topLanguages,
      followers: userData.followers,
      following: userData.following,
    });
  } catch (error) {
    console.error("Failed to fetch profile score:", error);
    return null;
  }
}

// Add inline profile score badge
async function addProfileScoreBadge() {
  const username = getUsernameFromPage();
  if (!username) {
    console.log("en-git: No username detected on this page");
    return;
  }

  // Check if badge already exists
  if (document.querySelector(".en-git-profile-score-badge")) {
    console.log("en-git: Profile score badge already exists");
    return;
  }

  console.log(`en-git: Adding profile score badge for ${username}`);

  // Find the profile header - try multiple selectors
  const profileHeader =
    document.querySelector(".vcard-names-container") ||
    document.querySelector("h1.vcard-names") ||
    document.querySelector('[itemprop="name"]')?.parentElement;

  if (!profileHeader) return;

  // Create loading badge first
  const badgeContainer = document.createElement("div");
  badgeContainer.className = "en-git-profile-score-badge";
  badgeContainer.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 10px 16px;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 2px solid rgba(168, 85, 247, 0.3);
    border-radius: 12px;
    animation: pulse 2s ease-in-out infinite;
  `;

  badgeContainer.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 16px; height: 16px; border: 2px solid #a855f7; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <span style="font-size: 13px; font-weight: 600; color: #a855f7;">Loading Profile Score...</span>
    </div>
  `;

  // Add animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    .en-git-profile-score-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
      transition: all 0.2s ease;
    }
  `;
  document.head.appendChild(style);

  profileHeader.appendChild(badgeContainer);

  // Fetch the actual score
  const profileScore = await fetchProfileScore(username);

  if (profileScore) {
    // Update badge with actual score
    badgeContainer.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding: 12px 20px;
      background: linear-gradient(135deg, ${profileScore.ratingColor}15 0%, ${profileScore.ratingColor}25 100%);
      border: 2px solid ${profileScore.ratingColor}60;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    badgeContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${profileScore.ratingColor}" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span style="font-size: 14px; font-weight: 600; color: ${profileScore.ratingColor};">Profile Score</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding-left: 12px; border-left: 2px solid ${profileScore.ratingColor}40;">
          <span style="font-size: 28px; line-height: 1;">${profileScore.ratingIcon}</span>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-size: 24px; font-weight: 700; color: ${profileScore.ratingColor}; line-height: 1;">${profileScore.score}</span>
            <span style="font-size: 10px; color: ${profileScore.ratingColor}; opacity: 0.8; line-height: 1;">/ 100</span>
          </div>
        </div>
        <div style="padding: 4px 10px; background: ${profileScore.ratingColor}; color: white; border-radius: 6px; font-size: 12px; font-weight: 600;">
          ${profileScore.rating}
        </div>
      </div>
    `;

    // Add click handler to open full analysis
    badgeContainer.onclick = () => {
      if (chrome.runtime?.id) {
        chrome.runtime.sendMessage(
          {
            action: "analyzeProfile",
            username: username,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log(
                "Extension context invalidated, please refresh the page"
              );
            }
          }
        );
      } else {
        window.open(`https://en-git.vercel.app/stats/${username}`, "_blank");
      }
    };

    // Add tooltip
    badgeContainer.title = `Click to view detailed analysis on en-git`;
  } else {
    // Show error state
    badgeContainer.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 2px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
    `;
    badgeContainer.innerHTML = `
      <span style="font-size: 13px; font-weight: 600; color: #ef4444;">Failed to load score</span>
    `;
  }
}

// Add "Analyze with en-git" button to GitHub profile pages
function addAnalyzeButton() {
  const username = getUsernameFromPage();
  if (!username) return;

  // Check if button already exists
  if (document.querySelector(".en-git-analyze-btn")) return;

  // Find the profile header
  const profileHeader =
    document.querySelector(".vcard-names-container") ||
    document.querySelector("h1.vcard-names");

  if (!profileHeader) return;

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "en-git-analyze-btn";
  buttonContainer.style.cssText = "margin-top: 12px;";

  // Create button
  const button = document.createElement("button");
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
    Analyze with en-git
  `;
  button.style.cssText = `
    padding: 8px 16px;
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  `;

  // Hover effects
  button.onmouseover = () => {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.4)";
  };
  button.onmouseout = () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 2px 8px rgba(99, 102, 241, 0.3)";
  };

  // Click handler
  button.onclick = () => {
    // Check if extension context is valid before sending message
    if (chrome.runtime?.id) {
      chrome.runtime.sendMessage(
        {
          action: "analyzeProfile",
          username: username,
        },
        (response) => {
          // Handle response or ignore errors if extension was reloaded
          if (chrome.runtime.lastError) {
            console.log(
              "Extension context invalidated, please refresh the page"
            );
          }
        }
      );
    } else {
      alert("Please reload the page - extension was updated");
    }
  };

  buttonContainer.appendChild(button);
  profileHeader.appendChild(buttonContainer);
}

// Add "Deep Dive" button to repository pages
function addRepoDiveButton() {
  const repoInfo = getRepoInfo();
  if (!repoInfo) return;

  // Check if button already exists
  if (document.querySelector(".en-git-repo-btn")) return;

  // Find repository header actions
  const repoActions =
    document.querySelector(".pagehead-actions") ||
    document.querySelector('[data-view-component="true"] ul');

  if (!repoActions) return;

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText =
    "display: inline-flex; gap: 8px; margin-left: 8px;";

  // Create Deep Dive button
  const diveButton = document.createElement("button");
  diveButton.className = "en-git-repo-btn";
  diveButton.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    Deep Dive
  `;
  diveButton.style.cssText = `
    padding: 6px 12px;
    background: #0ea5e9;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
  `;

  diveButton.onclick = () => {
    // Check if extension context is valid before sending message
    if (chrome.runtime?.id) {
      chrome.runtime.sendMessage(
        {
          action: "analyzeRepo",
          owner: repoInfo.owner,
          repo: repoInfo.repo,
        },
        (response) => {
          // Handle response or ignore errors if extension was reloaded
          if (chrome.runtime.lastError) {
            console.log(
              "Extension context invalidated, please refresh the page"
            );
          }
        }
      );
    } else {
      alert("Please reload the page - extension was updated");
    }
  };

  // Create Bookmark button
  const bookmarkButton = document.createElement("button");
  bookmarkButton.className = "en-git-bookmark-btn";
  bookmarkButton.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  bookmarkButton.style.cssText = `
    padding: 6px 10px;
    background: #06b6d4;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
  `;

  // Check if already bookmarked
  try {
    if (!isExtensionContextValid()) {
      console.log("en-git: Extension context invalid, skipping bookmark check");
      return;
    }

    chrome.storage.sync.get(["bookmarkedRepos"], (result) => {
      if (chrome.runtime.lastError) {
        console.log("en-git: Extension context invalidated, ignoring...");
        return;
      }

      const bookmarks = result.bookmarkedRepos || [];
      const isBookmarked = bookmarks.some(
        (b) => b.owner === repoInfo.owner && b.repo === repoInfo.repo
      );

      if (isBookmarked) {
        bookmarkButton.style.background = "#22c55e";
        bookmarkButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      }
    });
  } catch (error) {
    console.log("en-git: Error checking bookmarks:", error.message);
  }

  bookmarkButton.onclick = () => {
    if (!isExtensionContextValid()) {
      alert("Extension was reloaded. Please refresh the page.");
      return;
    }

    chrome.storage.sync.get(["bookmarkedRepos"], (result) => {
      if (chrome.runtime.lastError) {
        console.log("en-git: Extension context invalidated");
        return;
      }

      let bookmarks = result.bookmarkedRepos || [];
      const index = bookmarks.findIndex(
        (b) => b.owner === repoInfo.owner && b.repo === repoInfo.repo
      );

      if (index > -1) {
        // Remove bookmark
        bookmarks.splice(index, 1);
        bookmarkButton.style.background = "#06b6d4";
        bookmarkButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      } else {
        // Add bookmark
        const repoName =
          document.querySelector("strong[itemprop='name'] a")?.textContent ||
          repoInfo.repo;
        bookmarks.push({
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          name: repoName,
          url: window.location.href,
        });
        bookmarkButton.style.background = "#22c55e";
        bookmarkButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      }

      chrome.storage.sync.set({ bookmarkedRepos: bookmarks });
    });
  };

  buttonContainer.appendChild(diveButton);
  buttonContainer.appendChild(bookmarkButton);
  repoActions.prepend(buttonContainer);
}

// Run when page loads
function init() {
  const path = window.location.pathname;

  // Profile page
  if (path.match(/^\/[^\/]+\/?$/)) {
    setTimeout(() => {
      addProfileScoreBadge(); // Add profile score badge
      addAnalyzeButton();
    }, 1000);
  }

  // Repository page
  if (path.match(/^\/[^\/]+\/[^\/]+/)) {
    setTimeout(addRepoDiveButton, 1000);
  }
}

// Initialize
init();

// Re-run on navigation (GitHub uses PJAX)
let lastUrl = location.href;

// Method 1: MutationObserver (detects DOM changes)
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log("en-git: URL changed (MutationObserver), re-initializing...");
    init(); // Old features
    setTimeout(() => initCodeQuality(), 500); // Code quality badges
    setTimeout(() => initCodeQuality(), 1500); // Retry
  }
}).observe(document, { subtree: true, childList: true });

// Method 2: Listen for popstate events (browser back/forward)
window.addEventListener("popstate", () => {
  console.log("en-git: Navigation detected (popstate), re-initializing...");
  setTimeout(() => {
    init();
    initCodeQuality();
  }, 500);
});

// Method 3: Listen for pushstate/replacestate (PJAX navigation)
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function (...args) {
  originalPushState.apply(this, args);
  console.log("en-git: Navigation detected (pushState), re-initializing...");
  setTimeout(() => {
    init();
    initCodeQuality();
  }, 500);
  setTimeout(() => initCodeQuality(), 1500); // Retry
};

history.replaceState = function (...args) {
  originalReplaceState.apply(this, args);
  console.log("en-git: Navigation detected (replaceState), re-initializing...");
  setTimeout(() => {
    init();
    initCodeQuality();
  }, 500);
  setTimeout(() => initCodeQuality(), 1500); // Retry
};

// ==================== CODE QUALITY INDICATORS ====================

/**
 * Inject code quality badges on repository file listings
 * Note: CSS is loaded via manifest.json content_scripts
 */
async function injectCodeQualityBadges() {
  // Check if we're on a repository page with file listings
  const isRepoPage = window.location.pathname.match(/^\/[^\/]+\/[^\/]+/);
  if (!isRepoPage) return;

  // Check if feature is enabled in settings
  if (settings && settings.codeQuality && !settings.codeQuality.enabled) return;

  console.log("en-git: Injecting code quality badges...");

  // Strategy: Find file links and work backwards to their containers
  const fileLinks = document.querySelectorAll('a[href*="/blob/"]');
  console.log("en-git: Found file links:", fileLinks.length);

  if (fileLinks.length === 0) {
    console.log("en-git: No file links found. Waiting for page to load...");
    return;
  }

  // Get unique parent rows for each file link
  const fileRows = new Set();
  fileLinks.forEach((link) => {
    // Try to find the row container (could be parent, grandparent, etc.)
    let current = link;
    for (let i = 0; i < 5; i++) {
      current = current.parentElement;
      if (!current) break;

      // Check if this looks like a row container
      const className = current.className || "";
      const tagName = current.tagName.toLowerCase();

      if (
        tagName === "tr" ||
        className.includes("Box-row") ||
        className.includes("react-directory") ||
        className.includes("file-row") ||
        current.hasAttribute("role")
      ) {
        fileRows.add(current);
        break;
      }
    }
  });

  const fileRowsArray = Array.from(fileRows);
  console.log(`en-git: Found ${fileRowsArray.length} unique file rows`);

  if (fileRowsArray.length === 0) {
    console.log("en-git: Could not find file row containers");
    return;
  }

  await processFileRows(fileRowsArray);
}

/**
 * Process file rows and add badges
 */
async function processFileRows(fileRows) {
  const repoInfo = getRepoInfo();
  if (!repoInfo) return;

  // Process files in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < Math.min(fileRows.length, 20); i += batchSize) {
    const batch = Array.from(fileRows).slice(i, i + batchSize);
    await Promise.all(batch.map((row) => processFileRow(row, repoInfo)));

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * Process a single file row
 */
async function processFileRow(fileRow, repoInfo) {
  // Check if already processed
  if (fileRow.querySelector(".en-git-quality-badges")) {
    console.log("en-git: Row already processed, skipping");
    return;
  }

  // Extract file information
  const fileInfo = extractFileInfo(fileRow);
  if (!fileInfo) {
    console.log("en-git: Could not extract file info from row");
    return;
  }

  console.log("en-git: Processing file:", fileInfo.name);

  if (!isCodeFile(fileInfo.name)) {
    console.log("en-git: Not a code file, skipping:", fileInfo.name);
    return;
  }

  // Add "Analyze" button first
  console.log("en-git: Adding analyze button for:", fileInfo.name);
  addAnalyzeButton(fileRow, fileInfo, repoInfo);
}

/**
 * Extract file information from row
 */
function extractFileInfo(fileRow) {
  try {
    // Try multiple selectors for file links
    let fileLink = fileRow.querySelector('a[href*="/blob/"]');

    if (!fileLink) {
      fileLink = fileRow.querySelector('a[href*="/tree/"]');
    }

    if (!fileLink) {
      fileLink = fileRow.querySelector(".Link--primary");
    }

    if (!fileLink) {
      fileLink = fileRow.querySelector("a.Link");
    }

    if (!fileLink) {
      fileLink = fileRow.querySelector("a[title]");
    }

    if (!fileLink) {
      console.log("en-git: No file link found in row");
      return null;
    }

    const fileName = fileLink.textContent.trim();
    const filePath = fileLink.getAttribute("href");

    // Skip if it's a directory
    if (filePath && filePath.includes("/tree/")) {
      console.log("en-git: Skipping directory:", fileName);
      return null;
    }

    const extension = fileName.includes(".") ? fileName.split(".").pop() : "";

    console.log("en-git: Extracted file info:", {
      fileName,
      filePath,
      extension,
    });

    return {
      name: fileName,
      path: filePath,
      extension: extension,
    };
  } catch (error) {
    console.error("en-git: Error extracting file info:", error);
    return null;
  }
}

/**
 * Check if file is a code file that should be analyzed
 */
function isCodeFile(fileName) {
  const codeExtensions = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "java",
    "cpp",
    "c",
    "h",
    "hpp",
    "cs",
    "go",
    "rs",
    "rb",
    "php",
    "swift",
    "kt",
    "scala",
    "r",
    "m",
    "mm",
    "vue",
    "svelte",
    "dart",
    "lua",
    "pl",
    "sh",
    "bash",
  ];

  const ext = fileName.split(".").pop().toLowerCase();
  return codeExtensions.includes(ext);
}

/**
 * Add "Analyze" button to file row
 */
function addAnalyzeButton(fileRow, fileInfo, repoInfo) {
  const button = document.createElement("button");
  button.className = "en-git-analyze-button";
  button.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 11l3 3L22 4"></path>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
    Analyze Quality
  `;

  button.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await analyzeAndShowBadges(fileRow, fileInfo, repoInfo, button);
  };

  // Try multiple strategies to find where to insert the button
  let insertTarget = null;

  // Strategy 1: Find the file name cell
  insertTarget = fileRow.querySelector('[role="gridcell"]');

  // Strategy 2: Find any td element
  if (!insertTarget) {
    insertTarget = fileRow.querySelector("td");
  }

  // Strategy 3: Find the first div with the file name
  if (!insertTarget) {
    insertTarget = fileRow.querySelector('div[class*="react-directory"]');
  }

  // Strategy 4: Just append to the row itself
  if (!insertTarget) {
    insertTarget = fileRow;
  }

  if (insertTarget) {
    console.log("en-git: Adding button to:", insertTarget.className);
    insertTarget.appendChild(button);
  } else {
    console.log("en-git: Could not find place to insert button");
  }
}

/**
 * Analyze file and show quality badges
 */
async function analyzeAndShowBadges(fileRow, fileInfo, repoInfo, button) {
  // Disable button and show loading
  button.disabled = true;
  button.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="en-git-spinner">
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
    Analyzing...
  `;

  try {
    // Fetch file content
    const content = await fetchFileContent(
      repoInfo.owner,
      repoInfo.repo,
      fileInfo.path
    );

    if (!content) {
      throw new Error("Could not fetch file content");
    }

    // Analyze code quality
    const metrics = await codeQualityAnalyzer.analyzeFile(content, fileInfo);

    // Remove analyze button
    button.remove();

    // Create and inject badges
    const badgeContainer = createBadgeContainer(metrics, fileInfo, content);

    // Add click handler to show detail modal
    badgeContainer.querySelector(".en-git-quality-badge").onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showQualityDetailModal(fileInfo, metrics);
    };

    // Find a good place to insert badges
    const fileNameCell =
      fileRow.querySelector('[role="gridcell"]') || fileRow.querySelector("td");
    if (fileNameCell) {
      fileNameCell.appendChild(badgeContainer);
    }
  } catch (error) {
    console.error("Error analyzing file:", error);
    button.disabled = false;
    button.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      Retry
    `;
  }
}

/**
 * Fetch file content from GitHub
 */
async function fetchFileContent(owner, repo, filePath) {
  try {
    // Extract the actual file path from the href
    const pathMatch = filePath.match(/\/blob\/[^\/]+\/(.+)/);
    if (!pathMatch) return null;

    const actualPath = pathMatch[1];
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${actualPath}`;

    const response = await fetch(apiUrl);
    if (!response.ok) return null;

    const data = await response.json();

    // Decode base64 content
    const content = atob(data.content);
    return content;
  } catch (error) {
    console.error("Error fetching file content:", error);
    return null;
  }
}

/**
 * Create badge container with all badges
 */
function createBadgeContainer(metrics, fileInfo, content) {
  const container = document.createElement("div");
  container.className = "en-git-quality-badges";

  // Quality Score Badge
  const scoreBadge = createScoreBadge(metrics.qualityScore);
  container.appendChild(scoreBadge);

  // Complexity Badge
  const complexityBadge = createComplexityBadge(metrics.complexity);
  container.appendChild(complexityBadge);

  // Size Badge
  const sizeBadge = createSizeBadge(content.length);
  container.appendChild(sizeBadge);

  return container;
}

/**
 * Create quality score badge
 */
function createScoreBadge(score) {
  const badge = document.createElement("span");
  badge.className = "en-git-quality-badge";
  badge.textContent = score;
  badge.title = `Quality Score: ${score}/100`;

  // Color based on score
  if (score >= 80) {
    badge.classList.add("en-git-badge-excellent");
  } else if (score >= 60) {
    badge.classList.add("en-git-badge-good");
  } else if (score >= 40) {
    badge.classList.add("en-git-badge-fair");
  } else {
    badge.classList.add("en-git-badge-poor");
  }

  return badge;
}

/**
 * Create complexity badge
 */
function createComplexityBadge(complexity) {
  const badge = document.createElement("span");
  badge.className = "en-git-quality-badge";
  badge.textContent = complexity;
  badge.title = `Complexity: ${complexity}`;

  if (complexity === "Low") {
    badge.classList.add("en-git-badge-low");
  } else if (complexity === "Medium") {
    badge.classList.add("en-git-badge-medium");
  } else {
    badge.classList.add("en-git-badge-high");
  }

  return badge;
}

/**
 * Create size badge
 */
function createSizeBadge(bytes) {
  const badge = document.createElement("span");
  badge.className = "en-git-quality-badge";

  const kb = bytes / 1024;
  badge.textContent = kb < 1 ? `${bytes}B` : `${kb.toFixed(1)}KB`;
  badge.title = `File Size: ${badge.textContent}`;

  if (kb < 5) {
    badge.classList.add("en-git-badge-small");
  } else {
    badge.classList.add("en-git-badge-large");
  }

  return badge;
}

/**
 * Show detailed quality modal
 */
function showQualityDetailModal(fileInfo, metrics) {
  // Create modal overlay
  const overlay = document.createElement("div");
  overlay.className = "en-git-quality-modal-overlay";

  // Create modal
  const modal = document.createElement("div");
  modal.className = "en-git-quality-modal";

  // Modal header
  const header = document.createElement("div");
  header.className = "en-git-modal-header";
  header.innerHTML = `
    <h2 class="en-git-modal-title">📊 ${fileInfo.name}</h2>
    <button class="en-git-modal-close">×</button>
  `;

  // Close button handler
  header.querySelector(".en-git-modal-close").onclick = () => {
    overlay.remove();
  };

  // Click outside to close
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  };

  // Modal content
  const content = document.createElement("div");

  // Score section
  const scoreSection = document.createElement("div");
  scoreSection.className = "en-git-modal-score";
  const scoreColor = getScoreColor(metrics.qualityScore);
  scoreSection.innerHTML = `
    <div class="en-git-modal-score-value" style="color: ${scoreColor}">
      ${metrics.qualityScore}
    </div>
    <div class="en-git-modal-score-label">Quality Score</div>
  `;

  // Breakdown section
  const breakdownSection = document.createElement("div");
  breakdownSection.className = "en-git-modal-section";
  breakdownSection.innerHTML = `
    <div class="en-git-modal-section-title">
      📈 Score Breakdown
    </div>
  `;

  for (const [key, value] of Object.entries(metrics.breakdown)) {
    const item = document.createElement("div");
    item.className = "en-git-breakdown-item";
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const color = getScoreColor(value);
    item.innerHTML = `
      <span class="en-git-breakdown-label">${label}</span>
      <div class="en-git-breakdown-bar">
        <div class="en-git-breakdown-fill" style="width: ${value}%; background: ${color};"></div>
      </div>
      <span class="en-git-breakdown-value" style="color: ${color};">${value}</span>
    `;
    breakdownSection.appendChild(item);
  }

  // Issues section
  if (metrics.issues.length > 0) {
    const issuesSection = document.createElement("div");
    issuesSection.className = "en-git-modal-section";
    issuesSection.innerHTML = `
      <div class="en-git-modal-section-title">
        ⚠️ Issues Found
      </div>
    `;

    metrics.issues.forEach((issue) => {
      const item = document.createElement("div");
      item.className = "en-git-issue-item";
      item.innerHTML = `
        <span class="en-git-issue-icon">⚠️</span>
        <span>${issue.message}</span>
      `;
      issuesSection.appendChild(item);
    });

    content.appendChild(issuesSection);
  }

  // Suggestions section
  if (metrics.suggestions.length > 0) {
    const suggestionsSection = document.createElement("div");
    suggestionsSection.className = "en-git-modal-section";
    suggestionsSection.innerHTML = `
      <div class="en-git-modal-section-title">
        💡 Suggestions
      </div>
    `;

    metrics.suggestions.forEach((suggestion) => {
      const item = document.createElement("div");
      item.className = "en-git-suggestion-item";
      item.innerHTML = `
        <span class="en-git-suggestion-icon">💡</span>
        <span>${suggestion}</span>
      `;
      suggestionsSection.appendChild(item);
    });

    content.appendChild(suggestionsSection);
  }

  // Assemble modal
  content.prepend(breakdownSection);
  content.prepend(scoreSection);
  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * Get color based on score
 */
function getScoreColor(score) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

/**
 * Add quality badge for single file view (PR reviews, code reading)
 */
async function addSingleFileQualityBadge() {
  console.log("en-git: Adding quality badge to single file view...");

  // Check if already added - remove old ones first
  const existingBadges = document.querySelectorAll(
    ".en-git-file-quality-badge"
  );
  if (existingBadges.length > 0) {
    console.log("en-git: Removing", existingBadges.length, "existing badges");
    existingBadges.forEach((badge) => badge.remove());
  }

  // Get file info from URL
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)\/([^\/]+)\/blob\/[^\/]+\/(.+)$/);

  if (!match) {
    console.log("en-git: Could not parse file path");
    return;
  }

  const [, owner, repo, filePath] = match;
  const fileName = filePath.split("/").pop();

  console.log("en-git: File info:", { owner, repo, fileName, filePath });

  // Check if it's a code file
  if (!isCodeFile(fileName)) {
    console.log("en-git: Not a code file, skipping");
    return;
  }

  // Find the file header area - try multiple selectors
  let fileHeader =
    document.querySelector(".file-header") ||
    document.querySelector('[data-testid="file-header"]') ||
    document.querySelector(".Box-header") ||
    document.querySelector('[class*="react-code-view-header"]') ||
    document.querySelector("div.Box");

  if (!fileHeader) {
    console.log("en-git: Could not find file header, trying alternative...");
    // Try to find any header-like element near the top
    const headers = document.querySelectorAll("div[class*='Box']");
    if (headers.length > 0) {
      fileHeader = headers[0];
    }
  }

  if (!fileHeader) {
    console.log("en-git: Could not find file header");
    return;
  }

  console.log("en-git: Found file header:", fileHeader.className);

  // Create badge container
  const badgeContainer = document.createElement("div");
  badgeContainer.className = "en-git-file-quality-badge";
  badgeContainer.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 12px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  badgeContainer.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 11l3 3L22 4"></path>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
    <span>Analyze Code Quality</span>
  `;

  badgeContainer.onmouseover = () => {
    badgeContainer.style.transform = "translateY(-2px)";
  };

  badgeContainer.onmouseout = () => {
    badgeContainer.style.transform = "translateY(0)";
  };

  badgeContainer.onclick = async () => {
    badgeContainer.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
      <span>Analyzing...</span>
    `;

    try {
      // Try multiple selectors to get file content
      let codeLines = document.querySelectorAll(".blob-code-inner");
      console.log("en-git: Found code lines (selector 1):", codeLines.length);

      if (codeLines.length === 0) {
        codeLines = document.querySelectorAll("[data-code-text]");
        console.log("en-git: Found code lines (selector 2):", codeLines.length);
      }

      if (codeLines.length === 0) {
        codeLines = document.querySelectorAll("td.blob-code");
        console.log("en-git: Found code lines (selector 3):", codeLines.length);
      }

      if (codeLines.length === 0) {
        codeLines = document.querySelectorAll('[class*="react-code-text"]');
        console.log("en-git: Found code lines (selector 4):", codeLines.length);
      }

      if (codeLines.length === 0) {
        // Try to get from pre/code elements
        const preElement =
          document.querySelector("pre") || document.querySelector("code");
        if (preElement) {
          const content = preElement.textContent;
          console.log(
            "en-git: Extracted from pre/code, length:",
            content.length
          );

          if (content.length > 0) {
            await analyzeAndShowResults(
              content,
              fileName,
              filePath,
              badgeContainer
            );
            return;
          }
        }
        throw new Error("Could not find code content on page");
      }

      // Extract content from page
      const content = Array.from(codeLines)
        .map((line) => line.textContent)
        .join("\n");

      console.log("en-git: Extracted content, length:", content.length);

      await analyzeAndShowResults(content, fileName, filePath, badgeContainer);

      // Analyze
      const metrics = await codeQualityAnalyzer.analyzeFile(content, {
        name: fileName,
        extension: fileName.split(".").pop(),
        path: filePath,
      });

      console.log("en-git: Analysis complete:", metrics);

      // Update badge with results
      const scoreColor = getScoreColor(metrics.qualityScore);

      badgeContainer.style.background = `linear-gradient(135deg, ${scoreColor} 0%, ${scoreColor}dd 100%)`;
      badgeContainer.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>Score: ${metrics.qualityScore}/100</span>
        <span style="opacity: 0.8;">•</span>
        <span>${metrics.complexity}</span>
        <span style="opacity: 0.8;">•</span>
        <span>Click for Details</span>
      `;

      badgeContainer.onclick = () => {
        showQualityDetailModal(
          { name: fileName, extension: fileName.split(".").pop() },
          metrics
        );
      };
    } catch (error) {
      console.error("en-git: Error analyzing file:", error);
      badgeContainer.style.background =
        "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
      badgeContainer.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Error - Click to Retry</span>
      `;
    }
  };

  // Add to header
  fileHeader.appendChild(badgeContainer);
  console.log("en-git: Badge added successfully!");

  // Helper function to analyze and show results
  async function analyzeAndShowResults(
    content,
    fileName,
    filePath,
    badgeContainer
  ) {
    // Analyze
    const metrics = await codeQualityAnalyzer.analyzeFile(content, {
      name: fileName,
      extension: fileName.split(".").pop(),
      path: filePath,
    });

    console.log("en-git: Analysis complete:", metrics);

    // Update badge with results
    const scoreColor = getScoreColor(metrics.qualityScore);

    badgeContainer.style.background = `linear-gradient(135deg, ${scoreColor} 0%, ${scoreColor}dd 100%)`;
    badgeContainer.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span>Score: ${metrics.qualityScore}/100</span>
      <span style="opacity: 0.8;">•</span>
      <span>${metrics.complexity}</span>
      <span style="opacity: 0.8;">•</span>
      <span>Click for Details</span>
    `;

    // Make badge clickable to show modal
    badgeContainer.style.cursor = "pointer";
    badgeContainer.onclick = () => {
      showQualityDetailModal(
        { name: fileName, extension: fileName.split(".").pop() },
        metrics
      );
    };
  }
}

// Initialize code quality badges when on repo page
function initCodeQuality() {
  const path = window.location.pathname;

  console.log("en-git: Current path:", path);

  // Check if we're viewing a single file - ADD QUALITY BADGE HERE!
  if (path.includes("/blob/")) {
    console.log("en-git: ✅ Single file view detected - adding quality badge");
    setTimeout(addSingleFileQualityBadge, 1500);
    setTimeout(addSingleFileQualityBadge, 3000); // Retry
    return;
  }

  // For file listings, we don't add code quality badges anymore
  // (Only show on single file view for PR reviews)
  console.log("en-git: Not on single file view, skipping code quality badges");
}

// Run code quality initialization
initCodeQuality();
