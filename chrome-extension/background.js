// Background service worker for the extension
console.log("en-git extension background service worker loaded");

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("en-git extension installed!");
    // Open welcome page on first install
    chrome.tabs.create({
      url: "https://en-git.vercel.app",
    });
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeProfile") {
    const username = request.username;
    chrome.tabs.create({
      url: `https://en-git.vercel.app/stats/${username}`,
    });
    sendResponse({ success: true });
  }

  if (request.action === "compareUsers") {
    const { user1, user2 } = request;
    chrome.tabs.create({
      url: `https://en-git.vercel.app/compare/${user1}/${user2}`,
    });
    sendResponse({ success: true });
  }

  if (request.action === "analyzeRepo") {
    const { owner, repo } = request;
    chrome.tabs.create({
      url: `https://en-git.vercel.app/repo/${owner}/${repo}`,
    });
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

// Context menu integration - only create on install/update to avoid duplicates
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "analyze-github-profile",
      title: "Analyze with en-git",
      contexts: ["link"],
      targetUrlPatterns: ["https://github.com/*/*"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyze-github-profile") {
    const url = new URL(info.linkUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts.length >= 1) {
      const username = pathParts[0];
      chrome.tabs.create({
        url: `https://en-git.vercel.app/stats/${username}`,
      });
    }
  }
});
