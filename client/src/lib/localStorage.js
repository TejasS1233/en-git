// Utility functions for managing localStorage
import { exportUserBookmarks, importUserBookmarks } from "./bookmarkExport.js";

const BOOKMARKS_KEY = "github_insights_bookmarks";
const HISTORY_KEY = "github_insights_history";
const MAX_HISTORY = 10;

// Bookmarks
export function getBookmarks() {
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addBookmark(username, userData = {}) {
  const bookmarks = getBookmarks();
  const existing = bookmarks.find((b) => b.username === username);
  if (existing) return bookmarks; // Already bookmarked

  const newBookmark = {
    username,
    avatar: userData.avatar_url || null,
    name: userData.name || username,
    addedAt: new Date().toISOString(),
  };

  const updated = [newBookmark, ...bookmarks];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  return updated;
}

export function removeBookmark(username) {
  const bookmarks = getBookmarks();
  const updated = bookmarks.filter((b) => b.username !== username);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  return updated;
}

export function isBookmarked(username) {
  const bookmarks = getBookmarks();
  return bookmarks.some((b) => b.username === username);
}

// Search History
export function getSearchHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(username, userData = {}) {
  const history = getSearchHistory();

  // Remove if already exists
  const filtered = history.filter((h) => h.username !== username);

  const newEntry = {
    username,
    avatar: userData.avatar_url || null,
    searchedAt: new Date().toISOString(),
  };

  // Add to front and limit to MAX_HISTORY
  const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function clearSearchHistory() {
  localStorage.removeItem(HISTORY_KEY);
  return [];
}

// Export/Import functions
export function exportBookmarks() {
  return exportUserBookmarks();
}

export function importBookmarks(file) {
  return importUserBookmarks(file);
}

// Get bookmark statistics
export function getBookmarkStats() {
  const bookmarks = getBookmarks();
  return {
    total: bookmarks.length,
    recent: bookmarks.filter((b) => {
      const addedDate = new Date(b.addedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return addedDate > weekAgo;
    }).length,
  };
}
