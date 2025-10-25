// Bookmark export/import utilities

/**
 * Export user bookmarks to JSON file
 */
export function exportUserBookmarks() {
  try {
    const bookmarks = JSON.parse(localStorage.getItem("github_insights_bookmarks") || "[]");

    if (bookmarks.length === 0) {
      throw new Error("No bookmarks to export");
    }

    const exportData = {
      type: "github_insights_user_bookmarks",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      count: bookmarks.length,
      bookmarks: bookmarks.map((bookmark) => ({
        username: bookmark.username,
        name: bookmark.name,
        avatar: bookmark.avatar,
        addedAt: bookmark.addedAt,
        // Additional metadata
        description: `GitHub user: ${bookmark.name || bookmark.username}`,
        url: `https://github.com/${bookmark.username}`,
        type: "user",
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `github-user-bookmarks-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, count: bookmarks.length };
  } catch (error) {
    console.error("Export failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Import user bookmarks from JSON file
 */
export function importUserBookmarks(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validate file format
        if (!data.type || !data.bookmarks || !Array.isArray(data.bookmarks)) {
          throw new Error("Invalid bookmark file format");
        }

        if (data.type !== "github_insights_user_bookmarks") {
          throw new Error("This file is not a valid GitHub user bookmarks export");
        }

        const existingBookmarks = JSON.parse(
          localStorage.getItem("github_insights_bookmarks") || "[]"
        );
        const existingUsernames = new Set(existingBookmarks.map((b) => b.username));

        let imported = 0;
        let skipped = 0;

        data.bookmarks.forEach((bookmark) => {
          if (!existingUsernames.has(bookmark.username)) {
            existingBookmarks.push({
              username: bookmark.username,
              name: bookmark.name,
              avatar: bookmark.avatar,
              addedAt: bookmark.addedAt || new Date().toISOString(),
            });
            imported++;
          } else {
            skipped++;
          }
        });

        localStorage.setItem("github_insights_bookmarks", JSON.stringify(existingBookmarks));

        resolve({
          success: true,
          imported,
          skipped,
          total: data.bookmarks.length,
        });
      } catch (error) {
        console.error("Import failed:", error);
        resolve({ success: false, error: error.message });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: "Failed to read file" });
    };

    reader.readAsText(file);
  });
}

/**
 * Export repository bookmarks (Chrome extension)
 */
export function exportRepoBookmarks(bookmarks) {
  try {
    if (!bookmarks || bookmarks.length === 0) {
      throw new Error("No repository bookmarks to export");
    }

    const exportData = {
      type: "github_insights_repo_bookmarks",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      count: bookmarks.length,
      bookmarks: bookmarks.map((bookmark) => ({
        owner: bookmark.owner,
        repo: bookmark.repo,
        name: bookmark.name,
        url: bookmark.url,
        // Additional metadata
        description: `Repository: ${bookmark.name}`,
        fullName: `${bookmark.owner}/${bookmark.repo}`,
        type: "repository",
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `github-repo-bookmarks-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, count: bookmarks.length };
  } catch (error) {
    console.error("Export failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Import repository bookmarks (Chrome extension)
 */
export function importRepoBookmarks(file, existingBookmarks = []) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validate file format
        if (!data.type || !data.bookmarks || !Array.isArray(data.bookmarks)) {
          throw new Error("Invalid bookmark file format");
        }

        if (data.type !== "github_insights_repo_bookmarks") {
          throw new Error("This file is not a valid GitHub repository bookmarks export");
        }

        const existingKeys = new Set(existingBookmarks.map((b) => `${b.owner}/${b.repo}`));

        let imported = 0;
        let skipped = 0;

        data.bookmarks.forEach((bookmark) => {
          const key = `${bookmark.owner}/${bookmark.repo}`;
          if (!existingKeys.has(key)) {
            existingBookmarks.push({
              owner: bookmark.owner,
              repo: bookmark.repo,
              name: bookmark.name,
              url: bookmark.url,
            });
            imported++;
          } else {
            skipped++;
          }
        });

        resolve({
          success: true,
          imported,
          skipped,
          total: data.bookmarks.length,
          bookmarks: existingBookmarks,
        });
      } catch (error) {
        console.error("Import failed:", error);
        resolve({ success: false, error: error.message });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: "Failed to read file" });
    };

    reader.readAsText(file);
  });
}
