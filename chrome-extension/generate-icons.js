// Simple icon generator for extension
// You can replace these with actual designed icons later

const fs = require("fs");
const path = require("path");

function generateSVGIcon(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${
    size * 0.5
  }" font-weight="bold" fill="white">eg</text>
</svg>`;
}

const iconsDir = path.join(__dirname, "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons
[16, 48, 128].forEach((size) => {
  const svg = generateSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  console.log(`Generated icon${size}.svg`);
});

console.log(
  "\nPlaceholder icons created! Replace with actual PNG icons for production."
);
console.log("You can convert SVG to PNG using tools like:");
console.log("- https://cloudconvert.com/svg-to-png");
console.log("- https://www.iloveimg.com/svg-to-jpg");
