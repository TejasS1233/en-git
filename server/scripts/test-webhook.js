#!/usr/bin/env node

/**
 * Test script for GitHub Actions webhook integration
 * Usage: node test-webhook.js [username]
 */

import https from "https";

const API_URL = process.env.API_URL || "https://en-git.vercel.app";
const WEBHOOK_TOKEN = process.env.WEBHOOK_API_TOKEN;
const username = process.argv[2] || process.env.GITHUB_USERNAME;

if (!username) {
  console.error("❌ Error: Username is required");
  console.log("Usage: node test-webhook.js <username>");
  console.log("   or: GITHUB_USERNAME=username node test-webhook.js");
  process.exit(1);
}

if (!WEBHOOK_TOKEN) {
  console.error("❌ Error: WEBHOOK_API_TOKEN environment variable not set");
  console.log("Set it in your .env file or export it:");
  console.log("  export WEBHOOK_API_TOKEN=your_token_here");
  process.exit(1);
}

console.log("🧪 Testing en-git webhook integration...\n");

// Test 1: Health check
console.log("1️⃣  Testing webhook health endpoint...");
testHealthCheck();

// Test 2: Stats refresh
setTimeout(() => {
  console.log("\n2️⃣  Testing stats refresh endpoint...");
  testStatsRefresh();
}, 2000);

function testHealthCheck() {
  const url = `${API_URL}/api/v1/webhook/health`;

  https
    .get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("   ✅ Health check passed");
          try {
            const json = JSON.parse(data);
            console.log(`   📊 Response:`, json);
          } catch (e) {
            console.log(`   📊 Raw response:`, data);
          }
        } else {
          console.log(`   ❌ Health check failed (status: ${res.statusCode})`);
          console.log(`   📊 Response:`, data);
        }
      });
    })
    .on("error", (err) => {
      console.log("   ❌ Health check error:", err.message);
    });
}

function testStatsRefresh() {
  const url = new URL(`${API_URL}/api/v1/webhook/refresh-stats`);
  const postData = JSON.stringify({
    username: username,
    token: WEBHOOK_TOKEN,
  });

  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  console.log(`   👤 Testing for username: ${username}`);

  const req = https.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      if (res.statusCode === 200) {
        console.log("   ✅ Stats refresh successful!");
        try {
          const json = JSON.parse(data);
          console.log(`   📊 Response:`, json);
          console.log(`\n🎉 All tests passed!`);
          console.log(`🔗 View your stats: ${API_URL}/stats/${username}`);
        } catch (e) {
          console.log(`   📊 Raw response:`, data);
        }
      } else if (res.statusCode === 401) {
        console.log("   ❌ Authentication failed - invalid token");
        console.log("   💡 Check your WEBHOOK_API_TOKEN environment variable");
      } else {
        console.log(`   ❌ Stats refresh failed (status: ${res.statusCode})`);
        console.log(`   📊 Response:`, data);
      }
    });
  });

  req.on("error", (err) => {
    console.log("   ❌ Stats refresh error:", err.message);
  });

  req.write(postData);
  req.end();
}
