#!/usr/bin/env bash
# Opens Vocab 500 in its own window (no tabs or address bar) in a Chromium-based browser, else the default browser.
DIR="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
URL="file://$DIR/index.html"
for b in brave brave-browser brave-browser-stable google-chrome google-chrome-stable chromium chromium-browser microsoft-edge; do
  if command -v "$b" >/dev/null 2>&1; then exec "$b" --app="$URL" >/dev/null 2>&1; fi
done
exec xdg-open "$URL" >/dev/null 2>&1
