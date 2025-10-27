/**
 * Generate shareable tweet text from GitHub stats
 */
export function generateTweetText(insights) {
  if (!insights) return "";

  const { user, reposCount, languages, domain } = insights;

  // Calculate total stars
  const totalStars =
    insights.topStarred?.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) || 0;

  // Get top language
  const topLang = languages?.percentages?.length > 0 ? languages.percentages[0][0] : "Various";

  // Build tweet text
  const tweet =
    `🚀 My GitHub Stats:\n\n` +
    `📦 ${reposCount} repositories\n` +
    `⭐ ${totalStars} stars earned\n` +
    `💻 Top language: ${topLang}\n` +
    `👥 ${user.followers || 0} followers\n` +
    `🎯 Domain: ${domain || "Full-stack"}\n\n` +
    `Analyze yours with en-git! 👇\n` +
    `https://en-git-6fjm.vercel.app/stats/${user.login}`;

  return tweet;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Generate LinkedIn post text
 */
export function generateLinkedInPost(insights) {
  if (!insights) return "";

  const { user, reposCount, languages, domain } = insights;

  const totalStars =
    insights.topStarred?.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) || 0;

  const topLang = languages?.percentages?.length > 0 ? languages.percentages[0][0] : "Various";

  const post =
    `🎯 GitHub Year in Review\n\n` +
    `Just analyzed my developer profile with en-git and here's what I found:\n\n` +
    `📊 Key Metrics:\n` +
    `• ${reposCount} repositories\n` +
    `• ${totalStars} stars from the community\n` +
    `• ${user.followers || 0} followers\n` +
    `• Primary expertise: ${topLang}\n` +
    `• Focus area: ${domain || "Full-stack development"}\n\n` +
    `💡 As developers, tracking our growth helps us identify strengths and areas for improvement.\n\n` +
    `Want to see your GitHub analytics? Check out en-git:\n` +
    `https://en-git-6fjm.vercel.app\n\n` +
    `#GitHub #DeveloperTools #CodingJourney #TechCareer`;

  return post;
}

/**
 * Share on Twitter (opens new tab)
 * Can accept either text string or insights object
 */
export function shareOnTwitter(textOrInsights) {
  let text = textOrInsights;

  // If insights object is passed, generate tweet text
  if (typeof textOrInsights === "object" && textOrInsights !== null) {
    text = generateTweetText(textOrInsights);
  }

  const encoded = encodeURIComponent(text);
  const url = `https://twitter.com/intent/tweet?text=${encoded}`;
  window.open(url, "_blank");
}

/**
 * Share on LinkedIn (opens new tab)
 * Can accept either (url, title, summary) or insights object
 */
export async function shareOnLinkedIn(urlOrInsights, title, summary) {
  let text = "";
  let shareUrl = "";

  // If insights object is passed as first parameter
  if (typeof urlOrInsights === "object" && urlOrInsights !== null && !title && !summary) {
    text = generateLinkedInPost(urlOrInsights);
    const profileUrl = `https://en-git-6fjm.vercel.app/stats/${urlOrInsights.user?.login || ""}`;

    // LinkedIn's share dialog - try to include both text and URL
    // Note: LinkedIn may not pre-fill text in all cases due to their API restrictions
    const encodedUrl = encodeURIComponent(profileUrl);

    // Use the shareArticle endpoint which supports more parameters
    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    // Copy to clipboard first so user can easily paste
    await copyToClipboard(text);

    // Wait a bit before opening LinkedIn so user sees the "copied" message
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } else {
    // Traditional usage with url, title, summary
    const encodedUrl = encodeURIComponent(urlOrInsights);
    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }

  window.open(shareUrl, "_blank");
}
