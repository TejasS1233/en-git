# Extension Packaging Script for Chrome Web Store

Write-Host "📦 Packaging en-git Chrome Extension..." -ForegroundColor Cyan
Write-Host ""

$extensionDir = "chrome-extension"
$outputFile = "en-git-extension-v1.0.0.zip"

Write-Host "📋 Packaging extension files..." -ForegroundColor Yellow

# Remove old zip if exists
if (Test-Path $outputFile) {
    Remove-Item $outputFile
    Write-Host "  Removed old ZIP file" -ForegroundColor Gray
}

# Change to extension directory and create ZIP from there
Push-Location $extensionDir

# Files to include (explicitly list what we want)
$filesToInclude = @(
    "manifest.json",
    "background.js",
    "content.js",
    "content.css",
    "popup.html",
    "popup.js",
    "settings.html",
    "settings.js",
    "icons/*.png",
    "assets/*",
    "chunks/*"
)

Write-Host ""
Write-Host "🗜️  Creating ZIP archive..." -ForegroundColor Yellow

# Create ZIP with only necessary files
$files = @()
foreach ($pattern in $filesToInclude) {
    $matchedFiles = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    if ($matchedFiles) {
        $files += $matchedFiles
        foreach ($file in $matchedFiles) {
            Write-Host "  ✓ $($file.Name)" -ForegroundColor Green
        }
    }
}

# Create the ZIP
Compress-Archive -Path $filesToInclude -DestinationPath "..\$outputFile" -CompressionLevel Optimal -Force

# Go back to original directory
Pop-Location

# Get file size
$fileSize = (Get-Item $outputFile).Length / 1MB

Write-Host ""
Write-Host "✅ Package created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Output: $outputFile" -ForegroundColor Cyan
Write-Host "📊 Size: $($fileSize.ToString('0.00')) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://chrome.google.com/webstore/devconsole" -ForegroundColor White
Write-Host "  2. Click 'New Item'" -ForegroundColor White
Write-Host "  3. Upload $outputFile" -ForegroundColor White
Write-Host "  4. Fill in required information" -ForegroundColor White
Write-Host "  5. Submit for review" -ForegroundColor White
Write-Host ""
Write-Host "✨ Good luck with your submission!" -ForegroundColor Magenta
