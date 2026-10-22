#!/usr/bin/env bash
# ==============================================================================
# LingoMate Asset Synchronization Script (Bash / Linux / CI/CD)
# Synchronizes web root assets with Android WebView assets
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_ASSETS="${ROOT_DIR}/android/app/src/main/assets"

echo ">>> Synchronizing LingoMate Assets for Android..."
mkdir -p "${TARGET_ASSETS}/css" "${TARGET_ASSETS}/js"

# Root static files
cp -f "${ROOT_DIR}/index.html" "${TARGET_ASSETS}/"
cp -f "${ROOT_DIR}/manifest.json" "${TARGET_ASSETS}/"
cp -f "${ROOT_DIR}/sw.js" "${TARGET_ASSETS}/"
cp -f "${ROOT_DIR}/app_icon.ico" "${TARGET_ASSETS}/"
cp -f "${ROOT_DIR}/icon-192.png" "${TARGET_ASSETS}/"
cp -f "${ROOT_DIR}/icon-512.png" "${TARGET_ASSETS}/"

# CSS & JS
cp -f "${ROOT_DIR}/css/"*.css "${TARGET_ASSETS}/css/"
cp -f "${ROOT_DIR}/js/"*.js "${TARGET_ASSETS}/js/"

# Vendor assets
if [ -d "${ROOT_DIR}/vendor" ]; then
  cp -rf "${ROOT_DIR}/vendor" "${TARGET_ASSETS}/"
fi

# Remove dead code from assets if present
rm -f "${TARGET_ASSETS}/js/gemini.js"

echo ">>> Assets synchronized successfully."
