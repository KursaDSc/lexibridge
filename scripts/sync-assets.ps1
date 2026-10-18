# ==============================================================================
# LexiBridge Asset Synchronization Script (Windows PowerShell)
# Synchronizes web root assets with Android WebView assets to eliminate source drift
# ==============================================================================

$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path "$PSScriptRoot\.."
$TargetAssetsDir = Join-Path $RootDir "android\app\src\main\assets"

Write-Host ">>> Synchronizing LexiBridge Assets..." -ForegroundColor Cyan
Write-Host "    Source: $RootDir"
Write-Host "    Target: $TargetAssetsDir"

if (-not (Test-Path $TargetAssetsDir)) {
    New-Item -ItemType Directory -Force -Path $TargetAssetsDir | Out-Null
}

# Ensure subdirectories
$TargetCssDir = Join-Path $TargetAssetsDir "css"
$TargetJsDir = Join-Path $TargetAssetsDir "js"
if (-not (Test-Path $TargetCssDir)) { New-Item -ItemType Directory -Force -Path $TargetCssDir | Out-Null }
if (-not (Test-Path $TargetJsDir)) { New-Item -ItemType Directory -Force -Path $TargetJsDir | Out-Null }

# Files to copy
$RootFiles = @("index.html", "manifest.json", "sw.js", "app_icon.ico", "icon-192.png", "icon-512.png")
foreach ($f in $RootFiles) {
    $src = Join-Path $RootDir $f
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination (Join-Path $TargetAssetsDir $f) -Force
        Write-Host "  [OK] Copied $f" -ForegroundColor Green
    }
}

# CSS files
$CssFiles = Get-ChildItem -Path (Join-Path $RootDir "css") -File
foreach ($f in $CssFiles) {
    Copy-Item -Path $f.FullName -Destination (Join-Path $TargetCssDir $f.Name) -Force
    Write-Host "  [OK] Copied css/$($f.Name)" -ForegroundColor Green
}

# JS files (exclude test scripts or dead code if any)
$JsFiles = Get-ChildItem -Path (Join-Path $RootDir "js") -File
foreach ($f in $JsFiles) {
    Copy-Item -Path $f.FullName -Destination (Join-Path $TargetJsDir $f.Name) -Force
    Write-Host "  [OK] Copied js/$($f.Name)" -ForegroundColor Green
}

# Vendor files (Tailwind & Phosphor Icons)
if (Test-Path (Join-Path $RootDir "vendor")) {
    Copy-Item -Path (Join-Path $RootDir "vendor") -Destination $TargetAssetsDir -Recurse -Force
    Write-Host "  [OK] Copied vendor/ assets (Tailwind & Phosphor Icons)" -ForegroundColor Green
}

# Clean obsolete dead files from android assets if present
$ObsoleteGemini = Join-Path $TargetJsDir "gemini.js"
if (Test-Path $ObsoleteGemini) {
    Remove-Item -Path $ObsoleteGemini -Force
    Write-Host "  [OK] Removed obsolete dead code: js/gemini.js from assets" -ForegroundColor Yellow
}

Write-Host ">>> Asset synchronization completed successfully!" -ForegroundColor Cyan
