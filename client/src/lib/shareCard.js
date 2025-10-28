// Generate shareable image cards from profile data

export async function generateShareCard(insights) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630; // Twitter card size

  const ctx = canvas.getContext("2d");

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#667eea");
  gradient.addColorStop(1, "#764ba2");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add noise texture
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
  }
  ctx.globalAlpha = 1;

  // White card background
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.roundRect(60, 60, canvas.width - 120, canvas.height - 120, 20);
  ctx.fill();

  // Profile avatar (circle)
  if (insights.user.avatar_url) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = insights.user.avatar_url;
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(150, 160, 50, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 100, 110, 100, 100);
      ctx.restore();

      // Avatar border
      ctx.strokeStyle = "#667eea";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(150, 160, 52, 0, Math.PI * 2);
      ctx.stroke();
    } catch (e) {
      console.error("Failed to load avatar:", e);
    }
  }

  // Name and username
  ctx.fillStyle = "#1a202c";
  ctx.font = "bold 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(insights.user.name || insights.user.login, 230, 150);

  ctx.fillStyle = "#718096";
  ctx.font = "28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`@${insights.user.login}`, 230, 190);

  // Stats boxes
  const stats = [
    { label: "Repos", value: insights.reposCount },
    {
      label: "Stars",
      value: insights.topStarred?.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) || 0,
    },
    { label: "Languages", value: insights.languages?.top3?.length || 0 },
  ];

  let xPos = 100;
  stats.forEach((stat) => {
    ctx.fillStyle = "#f7fafc";
    ctx.fillRect(xPos, 250, 150, 100);

    ctx.fillStyle = "#667eea";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(stat.value.toString(), xPos + 75, 295);

    ctx.fillStyle = "#718096";
    ctx.font = "18px sans-serif";
    ctx.fillText(stat.label, xPos + 75, 325);

    xPos += 170;
  });
  ctx.textAlign = "left";

  // Top languages
  ctx.fillStyle = "#1a202c";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Top Languages", 630, 150);

  let langY = 190;
  (insights.languages?.top3 || []).slice(0, 3).forEach(([lang, percent]) => {
    // Language bar
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(630, langY, 450, 30);

    ctx.fillStyle = "#667eea";
    ctx.fillRect(630, langY, (percent / 100) * 450, 30);

    // Language name
    ctx.fillStyle = "#1a202c";
    ctx.font = "16px sans-serif";
    ctx.fillText(`${lang} ${percent}%`, 640, langY + 20);

    langY += 45;
  });

  // Badges Section
  const badges = [];
  const domain = insights.domain?.domain || "Developer";

  // Domain badge
  badges.push({ label: domain, color: "#667eea", icon: "🎯" });

  // Coding style badge
  if (insights.commitTimes?.profile === "night-coder") {
    badges.push({ label: "Night Coder", color: "#7c3aed", icon: "🌙" });
  } else {
    badges.push({ label: "Early Bird", color: "#f59e0b", icon: "🌅" });
  }

  // Activity level badge
  if (insights.reposCount > 50) {
    badges.push({ label: "Prolific", color: "#10b981", icon: "🚀" });
  } else if (insights.reposCount > 20) {
    badges.push({ label: "Active", color: "#3b82f6", icon: "⚡" });
  }

  // Star badge
  const totalStars =
    insights.topStarred?.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) || 0;
  if (totalStars > 100) {
    badges.push({ label: `${totalStars}★`, color: "#fbbf24", icon: "⭐" });
  }

  // Language polyglot badge
  const langCount = insights.languages?.percentages?.length || 0;
  if (langCount > 5) {
    badges.push({ label: "Polyglot", color: "#ec4899", icon: "🗣️" });
  }

  // Draw badges
  let badgeX = 630;
  let badgeY = 340;
  const maxBadgesPerRow = 2;
  let badgeCount = 0;

  badges.forEach((badge) => {
    // Measure badge text
    ctx.font = "bold 16px sans-serif";
    const textWidth = ctx.measureText(badge.label).width;
    const badgeWidth = textWidth + 50; // Extra space for icon and padding

    // Badge background with rounded corners
    ctx.fillStyle = badge.color;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, 36, 18);
    ctx.fill();

    // Badge icon
    ctx.font = "20px sans-serif";
    ctx.fillText(badge.icon, badgeX + 10, badgeY + 25);

    // Badge text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(badge.label, badgeX + 38, badgeY + 24);

    badgeX += badgeWidth + 15;
    badgeCount++;

    // Move to next row if needed
    if (badgeCount === maxBadgesPerRow) {
      badgeX = 630;
      badgeY += 50;
      badgeCount = 0;
    }
  });

  // Top topics (small pills)
  if (insights.topics?.length > 0) {
    ctx.fillStyle = "#4a5568";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("Topics:", 100, 360);

    let topicX = 100;
    let topicY = 385;
    const maxTopicsWidth = 500;

    insights.topics.slice(0, 8).forEach(([topic]) => {
      ctx.font = "14px sans-serif";
      const topicWidth = ctx.measureText(topic).width + 20;

      // Check if we need to wrap
      if (topicX + topicWidth > 100 + maxTopicsWidth) {
        topicX = 100;
        topicY += 35;
      }

      // Draw topic pill
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.roundRect(topicX, topicY, topicWidth, 26, 13);
      ctx.fill();

      ctx.fillStyle = "#4a5568";
      ctx.fillText(topic, topicX + 10, topicY + 18);

      topicX += topicWidth + 10;
    });
  }

  // Footer with gradient effect
  ctx.fillStyle = "#a0aec0";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("en-git", 100, 540);

  ctx.font = "14px sans-serif";
  ctx.fillText("AI-driven GitHub Analytics • Created by TejasS1233", 100, 565);

  // Add a subtle "Verified" style checkmark
  ctx.fillStyle = "#667eea";
  ctx.font = "20px sans-serif";
  ctx.fillText("✓", 165, 540);

  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

export async function downloadShareCard(insights) {
  const blob = await generateShareCard(insights);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${insights.user.login}-github-card.png`;
  a.click();

  URL.revokeObjectURL(url);
}
