// Smooth Line Chart Activity Widget
export async function generateActivityLineChart(username, theme) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const bgSecondary = isDark ? "#161b22" : "#f6f8fa";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#c9d1d9" : "#24292f";
  const subtext = isDark ? "#8b949e" : "#57606a";
  const accent = isDark ? "#58a6ff" : "#0969da";
  const success = isDark ? "#3fb950" : "#1a7f37";
  const purple = isDark ? "#a855f7" : "#9333ea";

  const WidgetCache = (await import("../models/widgetCache.model.js")).default;
  const cached = await WidgetCache.findOne({ username }).lean();

  if (!cached || !cached.insights?.weekly) {
    // Return not found SVG
    return `<svg width="800" height="240"><text x="400" y="120" text-anchor="middle">No data</text></svg>`;
  }

  // Weekly data format: [["2025-W44", 100], ["2025-W43", 50], ...]
  const weeklyRaw = cached.insights.weekly || [];

  // Reverse to show oldest to newest (left to right), take last 12 weeks
  const weeks = weeklyRaw.slice(0, 12).reverse();
  const totalContributions = weeks.reduce(
    (sum, week) => sum + (Array.isArray(week) ? week[1] : 0),
    0
  );
  const maxContributions = Math.max(...weeks.map((week) => (Array.isArray(week) ? week[1] : 0)), 1);
  const avgContributions = Math.round(totalContributions / weeks.length);

  // Create smooth line chart
  const chartWidth = 680;
  const chartHeight = 140;
  const startX = 60;
  const startY = 70;
  const pointSpacing = chartWidth / (weeks.length - 1 || 1);

  // Generate points for the line
  const points = weeks.map((week, idx) => {
    const value = Array.isArray(week) ? week[1] : 0;
    const x = startX + idx * pointSpacing;
    const y = startY + chartHeight - (value / maxContributions) * chartHeight;
    return { x, y, value };
  });

  // Create smooth curve path using quadratic bezier curves
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    pathData += ` Q ${current.x} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
    pathData += ` Q ${next.x} ${next.y}, ${next.x} ${next.y}`;
  }

  // Create area fill path
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${startY + chartHeight} L ${startX} ${startY + chartHeight} Z`;

  return `
    <svg width="800" height="240" viewBox="-10 -10 820 260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accent}" />
          <stop offset="50%" style="stop-color:${purple}" />
          <stop offset="100%" style="stop-color:${success}" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.05" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="800" height="240" fill="${bg}" rx="12"/>
      <rect width="800" height="240" fill="${bgSecondary}" fill-opacity="0.2" rx="12"/>
      
      <!-- Header -->
      <text x="400" y="30" fill="url(#lineGrad)" font-size="20" font-weight="700" font-family="system-ui" text-anchor="middle">
        Activity Trend
      </text>
      <text x="400" y="50" fill="${subtext}" font-size="12" font-family="system-ui" text-anchor="middle">
        ${totalContributions} contributions • ${avgContributions} avg/week
      </text>
      
      <!-- Grid lines -->
      ${[0, 1, 2, 3, 4]
      .map((i) => {
        const y = startY + (i * chartHeight) / 4;
        return `<line x1="${startX}" y1="${y}" x2="${startX + chartWidth}" y2="${y}" stroke="${border}" stroke-width="1" opacity="0.2" stroke-dasharray="5,5"/>`;
      })
      .join("")}
      
      <!-- Area fill -->
      <path d="${areaPath}" fill="url(#areaGrad)"/>
      
      <!-- Line -->
      <path d="${pathData}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
      
      <!-- Data points -->
      ${points
      .map(
        (point, idx) => `
        <circle cx="${point.x}" cy="${point.y}" r="5" fill="${bg}" stroke="url(#lineGrad)" stroke-width="3" filter="url(#glow)">
          <title>Week ${idx + 1}: ${point.value} contributions</title>
        </circle>
      `
      )
      .join("")}
      
      <!-- Week labels -->
      ${points
      .map((point, idx) => {
        if (idx % 2 === 0 || weeks.length <= 6) {
          return `<text x="${point.x}" y="${startY + chartHeight + 20}" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="middle">W${idx + 1}</text>`;
        }
        return "";
      })
      .join("")}
      
      <!-- Y-axis labels -->
      <text x="${startX - 10}" y="${startY + 5}" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="end">
        ${maxContributions}
      </text>
      <text x="${startX - 10}" y="${startY + chartHeight / 2 + 5}" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="end">
        ${Math.round(maxContributions / 2)}
      </text>
      <text x="${startX - 10}" y="${startY + chartHeight + 5}" fill="${subtext}" font-size="10" font-family="system-ui" text-anchor="end">
        0
      </text>
      
      <text x="400" y="235" fill="${subtext}" font-size="9" font-family="system-ui" text-anchor="middle" opacity="0.7">
        powered by en-git
      </text>
    </svg>
  `;
}
