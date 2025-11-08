import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { updateUserStatsCache } from "../services/statsCache.service.js";
import { Challenge } from "../models/challenge.model.js";
import { User } from "../models/user.model.js";


const verifyGitHubSignature = (payload, signature, secret) => {
  if (!signature) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
};

/**
 * Handle GitHub webhook events
 * POST /api/v1/webhook/github
 */
const handleGitHubWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const event = req.headers["x-github-event"];
  const deliveryId = req.headers["x-github-delivery"];

  // Verify webhook signature
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new ApiError(500, "Webhook secret not configured");
  }

  const rawBody = JSON.stringify(req.body);
  if (!verifyGitHubSignature(rawBody, signature, webhookSecret)) {
    throw new ApiError(401, "Invalid webhook signature");
  }

  console.log(`📨 Received GitHub webhook: ${event} (${deliveryId})`);

  // Extract username from the payload
  const username = req.body.sender?.login || req.body.pusher?.name;
  
  if (!username) {
    throw new ApiError(400, "Could not extract username from webhook payload");
  }

  // Handle different event types
  let updateResult = null;
  
  switch (event) {
    case "push":
      updateResult = await handlePushEvent(req.body, username);
      break;
    
    case "pull_request":
      updateResult = await handlePullRequestEvent(req.body, username);
      break;
    
    case "issues":
      updateResult = await handleIssuesEvent(req.body, username);
      break;
    
    case "star":
    case "watch":
      updateResult = await handleStarEvent(req.body, username);
      break;
    
    case "fork":
      updateResult = await handleForkEvent(req.body, username);
      break;
    
    default:
      console.log(` Unhandled event type: ${event}`);
      return res
        .status(200)
        .json(new ApiResponse(200, { event, action: "ignored" }, "Event received but not processed"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateResult, `${event} event processed successfully`));
});

/**
 * Handle push events
 */
const handlePushEvent = async (payload, username) => {
  const commits = payload.commits || [];
  const repository = payload.repository?.name;
  const branch = payload.ref?.replace("refs/heads/", "");

  console.log(`📝 Push event: ${username} pushed ${commits.length} commits to ${repository}/${branch}`);

  // Invalidate stats cache to force refresh
  await updateUserStatsCache(username);

  // Check if this completes any challenges
  await updateChallenges(username, "push", {
    commits: commits.length,
    repository,
    branch,
  });

  return {
    event: "push",
    username,
    repository,
    branch,
    commits: commits.length,
    statsUpdated: true,
  };
};

/**
 * Handle pull request events
 */
const handlePullRequestEvent = async (payload, username) => {
  const action = payload.action; // opened, closed, merged, etc.
  const pullRequest = payload.pull_request;
  const repository = payload.repository?.name;

  console.log(`🔀 PR event: ${username} ${action} PR #${pullRequest.number} in ${repository}`);

  await updateUserStatsCache(username);

  // Check for PR-related challenges
  if (action === "opened") {
    await updateChallenges(username, "pull_request_opened", {
      repository,
      prNumber: pullRequest.number,
    });
  } else if (action === "closed" && pullRequest.merged) {
    await updateChallenges(username, "pull_request_merged", {
      repository,
      prNumber: pullRequest.number,
    });
  }

  return {
    event: "pull_request",
    action,
    username,
    repository,
    prNumber: pullRequest.number,
    statsUpdated: true,
  };
};

/**
 * Handle issues events
 */
const handleIssuesEvent = async (payload, username) => {
  const action = payload.action; // opened, closed, etc.
  const issue = payload.issue;
  const repository = payload.repository?.name;

  console.log(`🐛 Issue event: ${username} ${action} issue #${issue.number} in ${repository}`);

  await updateUserStatsCache(username);

  if (action === "opened") {
    await updateChallenges(username, "issue_opened", {
      repository,
      issueNumber: issue.number,
    });
  } else if (action === "closed") {
    await updateChallenges(username, "issue_closed", {
      repository,
      issueNumber: issue.number,
    });
  }

  return {
    event: "issues",
    action,
    username,
    repository,
    issueNumber: issue.number,
    statsUpdated: true,
  };
};

/**
 * Handle star events
 */
const handleStarEvent = async (payload, username) => {
  const action = payload.action;
  const repository = payload.repository?.name;
  const stargazer = payload.sender?.login;

  console.log(`⭐ Star event: ${stargazer} ${action} star on ${repository}`);

  // Update the repo owner's stats
  const repoOwner = payload.repository?.owner?.login;
  if (repoOwner) {
    await updateUserStatsCache(repoOwner);
    
    if (action === "created") {
      await updateChallenges(repoOwner, "star_received", {
        repository,
        stargazer,
      });
    }
  }

  return {
    event: "star",
    action,
    repository,
    owner: repoOwner,
    stargazer,
    statsUpdated: true,
  };
};

/**
 * Handle fork events
 */
const handleForkEvent = async (payload, username) => {
  const repository = payload.repository?.name;
  const forkee = payload.forkee?.full_name;

  console.log(`🍴 Fork event: ${username} forked ${repository} to ${forkee}`);

  // Update the repo owner's stats
  const repoOwner = payload.repository?.owner?.login;
  if (repoOwner) {
    await updateUserStatsCache(repoOwner);
    
    await updateChallenges(repoOwner, "fork_received", {
      repository,
      forker: username,
    });
  }

  return {
    event: "fork",
    repository,
    owner: repoOwner,
    forker: username,
    statsUpdated: true,
  };
};

/**
 * Update user challenges based on activity
 */
const updateChallenges = async (username, eventType, eventData) => {
  try {
    // Find user
    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      console.log(`User not found for webhook update: ${username}`);
      return;
    }

    // Find active challenges for this user
    const activeChallenges = await Challenge.find({
      user: user._id,
      status: "active",
    });

    if (activeChallenges.length === 0) {
      return;
    }

    // Update challenges based on event type
    for (const challenge of activeChallenges) {
      let shouldUpdate = false;

      switch (eventType) {
        case "push":
          if (challenge.type === "commits" || challenge.type === "contributions") {
            shouldUpdate = true;
          }
          break;
        
        case "pull_request_opened":
          if (challenge.type === "pull_requests") {
            challenge.currentValue += 1;
            shouldUpdate = true;
          }
          break;
        
        case "pull_request_merged":
          if (challenge.type === "merged_prs") {
            challenge.currentValue += 1;
            shouldUpdate = true;
          }
          break;
        
        case "issue_opened":
          if (challenge.type === "issues_opened") {
            challenge.currentValue += 1;
            shouldUpdate = true;
          }
          break;
        
        case "issue_closed":
          if (challenge.type === "issues_closed") {
            challenge.currentValue += 1;
            shouldUpdate = true;
          }
          break;
        
        case "star_received":
          if (challenge.type === "stars") {
            challenge.currentValue += 1;
            shouldUpdate = true;
          }
          break;
        
        case "fork_received":
          if (challenge.type === "forks") {
            challenge.currentValue += 1;
            shouldUpdate = true;
          }
          break;
      }

      if (shouldUpdate) {
        // Check if challenge is completed
        if (challenge.currentValue >= challenge.targetValue) {
          challenge.status = "completed";
          challenge.completedAt = new Date();
          console.log(`🎉 Challenge completed: ${challenge.title} by ${username}`);
        }

        await challenge.save();
      }
    }
  } catch (error) {
    console.error("Error updating challenges:", error);
  }
};

/**
 * Manual stats refresh endpoint (for GitHub Actions)
 * POST /api/v1/webhook/refresh-stats
 */
const refreshUserStats = asyncHandler(async (req, res) => {
  const { username, token } = req.body;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  // Find user and verify their webhook token
  const user = await User.findOne({ githubUsername: username }).select("+webhookToken");
  
  if (!user) {
    throw new ApiError(404, "User not found. Please sign up on en-git first.");
  }

  // Check if user has a webhook token
  if (!user.webhookToken) {
    throw new ApiError(401, "Webhook token not generated. Please generate one from your settings page.");
  }

  // Verify the token matches
  if (user.webhookToken !== token) {
    throw new ApiError(401, "Invalid webhook token");
  }

  console.log(`🔄 Manual stats refresh requested for: ${username}`);

  // Force stats cache update
  await updateUserStatsCache(username);

  // Update user's last activity
  user.lastActivity = new Date();
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { username, updated: true }, "Stats refreshed successfully"));
});

/**
 * Health check for webhook endpoint
 * GET /api/v1/webhook/health
 */
const webhookHealth = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { status: "healthy" }, "Webhook service is running"));
});

/**
 * Get user's webhook token
 * GET /api/v1/webhook/token
 * Requires authentication
 */
const getWebhookToken = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await User.findById(req.user._id).select("+webhookToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If user doesn't have a token, generate one
  if (!user.webhookToken) {
    user.webhookToken = user.generateWebhookToken();
    await user.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Webhook token retrieved successfully", { token: user.webhookToken }));
});

/**
 * Regenerate user's webhook token
 * POST /api/v1/webhook/regenerate-token
 * Requires authentication
 */
const regenerateWebhookToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+webhookToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate new token
  user.webhookToken = user.generateWebhookToken();
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Webhook token regenerated successfully", { token: user.webhookToken }));
});

export { 
  handleGitHubWebhook, 
  refreshUserStats, 
  webhookHealth,
  getWebhookToken,
  regenerateWebhookToken
};
