# en-git Chrome Extension 🚀

AI-Powered GitHub Analytics right in your browser!

## Features

### 🆕 New Code Quality Features

- 🎯 **Inline Profile Score Badge**: Profile score appears directly on GitHub profile pages
  - Automatic detection when viewing any profile
  - Shows score (0-100), rating, and icon
  - Purple "Deeper Analysis" button below badge
  - Click to open full analysis on en-git website
- 📊 **Single File Code Quality Analysis**: Perfect for PR reviews!
  - Appears on single file views (`/blob/` pages)
  - "Analyze Code Quality" button in file header
  - Real-time analysis with quality score (0-100)
  - Complexity level (Low/Medium/High)
  - Detailed modal with score breakdown, issues, and suggestions
  - Automatic navigation detection - no reload needed!

### Core Features

- 🎯 **Quick Analysis**: Analyze any GitHub profile with one click
- 📊 **Compare Users**: Side-by-side comparison of developers
- 💡 **AI Insights**: Get career recommendations powered by Google Gemini
- 🏆 **Gamification**: View badges and achievements
- 📈 **Repository Deep Dive**: Detailed repo health scores and analytics
- ⚡ **GitHub Integration**: Adds analyze buttons directly on GitHub pages
- 🎨 **Custom Themes**: Personalize GitHub with custom colors
- ⌨️ **Keyboard Shortcuts**: Navigate faster with hotkeys
- 🔖 **Repository Bookmarks**: Save and organize favorite repos

## Installation (Development)

1. **Build the extension:**

   ```bash
   cd client
   npm run build:extension
   ```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the `chrome-extension` folder
   - The extension should now appear in your toolbar! 🎉

## Usage

### From the Popup

1. Click the extension icon in your Chrome toolbar
2. Enter a GitHub username
3. Click "Analyze Profile" to get detailed insights

### On GitHub Pages

When browsing GitHub:

- **Profile pages**: See an "Analyze with en-git" button
- **Repository pages**: See a "Deep Dive" button
- **Right-click any GitHub link**: Select "Analyze with en-git" from context menu

## Converting Icons to PNG

The extension currently uses SVG placeholders. For production:

1. Convert `icons/*.svg` to PNG using:

   - [CloudConvert](https://cloudconvert.com/svg-to-png)
   - [Squoosh](https://squoosh.app/)
   - Or use a design tool like Figma/Photoshop

2. Replace the SVG files with PNG files:

   - `icon16.png` (16x16px)
   - `icon48.png` (48x48px)
   - `icon128.png` (128x128px)

3. Update `manifest.json` to use `.png` instead of `.svg`

## Publishing to Chrome Web Store

1. **Prepare for production:**

   - Replace SVG icons with high-quality PNGs
   - Add screenshots (1280x800 or 640x400)
   - Create promotional images
   - Test thoroughly

2. **Create ZIP file:**

   ```bash
   cd chrome-extension
   # Remove unnecessary files
   rm generate-icons.js README.md
   # Create zip
   zip -r en-git-extension.zip *
   ```

3. **Upload to Chrome Web Store:**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay one-time $5 developer fee (if first time)
   - Click "New Item" and upload the ZIP
   - Fill in listing details, screenshots, and privacy policy
   - Submit for review (usually 1-3 days)

## Development

### File Structure

```
chrome-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Popup UI
├── popup.js          # Built React app for popup
├── background.js     # Service worker (handles lifecycle)
├── content.js        # Injected into GitHub pages
├── content.css       # Styles for injected elements
├── icons/            # Extension icons
└── assets/           # Built assets (CSS, images)
```

### Rebuilding

After making changes to the React app:

```bash
cd client
npm run build:extension
```

Then reload the extension in Chrome:

- Go to `chrome://extensions/`
- Click the refresh icon on your extension

## Permissions Explained

- **activeTab**: Read current tab URL (to detect GitHub pages)
- **storage**: Save recent analyses locally
- **tabs**: Open new tabs with analysis results
- **host_permissions**: Access GitHub API and backend

## Troubleshooting

**Extension not loading:**

- Make sure you ran `npm run build:extension` first
- Check that all files exist in `chrome-extension/` folder

**Popup is blank:**

- Open DevTools on the popup (right-click extension icon → Inspect)
- Check console for errors

**Buttons not appearing on GitHub:**

- Refresh the GitHub page
- Check if content script is loaded (Console → check for "en-git content script loaded")

## Future Features

- [ ] Keyboard shortcuts (e.g., Alt+G to analyze current profile)
- [ ] Badge notifications for new insights
- [ ] Export reports as PDF directly from popup
- [ ] Dark/light theme toggle
- [ ] Customizable dashboard widgets

## License

Part of the en-git project by Tejas
