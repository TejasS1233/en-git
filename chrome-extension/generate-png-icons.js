import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 48, 128];

async function generatePNGIcons() {
  console.log("🎨 Generating PNG icons from SVG...\n");

  for (const size of sizes) {
    try {
      const svgPath = join(__dirname, "icons", `icon${size}.svg`);
      const pngPath = join(__dirname, "icons", `icon${size}.png`);

      // Read SVG file
      const svgBuffer = readFileSync(svgPath);

      // Convert to PNG with sharp
      await sharp(svgBuffer)
        .resize(size, size)
        .png({
          compressionLevel: 9,
          quality: 100,
        })
        .toFile(pngPath);

      console.log(`✅ Generated icon${size}.png (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error generating icon${size}.png:`, error.message);
    }
  }

  console.log("\n✨ PNG icon generation complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Update manifest.json to use .png instead of .svg");
  console.log("2. Verify icons look good by loading the extension");
  console.log("3. You can now delete the SVG files if desired");
}

generatePNGIcons();
