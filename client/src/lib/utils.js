import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export const GITHUB_REPO_REGEX = /^(?!\.)(?!.*\.$)(?!.*\.\.)[A-Za-z0-9._-]{1,100}$/;

function isLikelyUrl(value) {
  const v = String(value || "").trim();
  
  return (
    /^(https?:\/\/)/i.test(v) || // explicit http/https
    /^www\./i.test(v) || // www.
    /github\.com\//i.test(v) || // explicit github domain path
    /^[a-z]+:\/\//i.test(v) // any scheme://
  );
}

export function validateGithubUsername(input) {
  const value = String(input || "").trim();
  if (!value) {
    return { valid: false, reason: "empty", message: "Please enter a GitHub username." };
  }
  if (isLikelyUrl(value)) {
    return {
      valid: false,
      reason: "url",
      message: "Enter only your username, not a URL.",
    };
  }
  if (value.includes("/")) {
    return {
      valid: false,
      reason: "slash",
      message: "Enter only your username (no slashes).",
    };
  }
  if (!GITHUB_USERNAME_REGEX.test(value)) {
    return {
      valid: false,
      reason: "invalid",
      message:
        "Invalid GitHub username.",
    };
  }
  return { valid: true, value };
}

export function validateRepoOwner(input) {
  // Alias for username validation for clarity in repo context
  return validateGithubUsername(input);
}

export function validateRepoName(input) {
  const value = String(input || "").trim();
  if (!value) {
    return { valid: false, reason: "empty", message: "Please enter a repository name." };
  }
  if (isLikelyUrl(value)) {
    return {
      valid: false,
      reason: "url",
      message: "Enter only the repository name, not a URL.",
    };
  }
  if (value.includes("/")) {
    return {
      valid: false,
      reason: "slash",
      message: "Enter only the repository name, not owner/repo.",
    };
  }
  if (!GITHUB_REPO_REGEX.test(value)) {
    return {
      valid: false,
      reason: "invalid",
      message:
        "Invalid repository name.",
    };
  }
  return { valid: true, value };
}

/**
 * Parse a GitHub repository URL or shorthand and return owner/repo.
 * Supports:
 * - https://github.com/owner/repo
 * - http://github.com/owner/repo
 * - github.com/owner/repo
 * - git@github.com:owner/repo.git
 * - owner/repo
 */
export function parseGithubRepoUrl(input) {
  const value = String(input || "").trim();
  if (!value) return { valid: false, message: "" };

  // Try to match owner/repo in several common patterns
  const re = /(?:github\.com[/:]|git@github\.com:)?(?<owner>[A-Za-z0-9._-]{1,100})\/(?<repo>[A-Za-z0-9._-]{1,100})(?:\.git)?(?:[\/]|$)/i;
  const m = value.match(re);
  if (m && m.groups && m.groups.owner && m.groups.repo) {
    const owner = m.groups.owner;
    const repo = m.groups.repo.replace(/\.git$/i, "");
    // Basic validation using existing validators
    const ownerRes = validateRepoOwner(owner);
    const repoRes = validateRepoName(repo);
    if (!ownerRes.valid) return { valid: false, message: ownerRes.message };
    if (!repoRes.valid) return { valid: false, message: repoRes.message };
    return { valid: true, owner: ownerRes.value, repo: repoRes.value };
  }

  // Fallback: maybe user typed owner/repo with nothing else
    if (/^[^\s\/]+\/[^\s\/]+$/.test(value)) {
    const parts = value.split(/\//);
    const owner = parts[0];
    const repo = parts[1];
    const ownerRes = validateRepoOwner(owner);
    const repoRes = validateRepoName(repo);
    if (ownerRes.valid && repoRes.valid) {
      return { valid: true, owner: ownerRes.value, repo: repoRes.value };
    }
    return { valid: false, message: ownerRes.message || repoRes.message };
  }

  return { valid: false, message: "Unable to parse a GitHub repository from the input." };
}
