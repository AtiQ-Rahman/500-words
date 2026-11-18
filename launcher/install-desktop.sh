#!/usr/bin/env bash
# Adds a "Vocab 500" icon to the Desktop and the app menu (Linux). The app runs from these files:
# no server, no internet needed (fonts fall back to the system ones when offline).
set -e
DIR="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
chmod +x "$DIR/launcher/open.sh"
APPS="$HOME/.local/share/applications"
DESK="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"
mkdir -p "$APPS" "$DESK"
ENTRY="[Desktop Entry]
Type=Application
Version=1.0
Name=Vocab 500
GenericName=Vocabulary
Comment=Learn the book's 500 words: meaning, memory trick, close words, quiz
Exec=\"$DIR/launcher/open.sh\"
Icon=$DIR/icon-256.png
Terminal=false
Categories=Education;
StartupNotify=true"
printf '%s\n' "$ENTRY" >"$APPS/vocab-500.desktop"
printf '%s\n' "$ENTRY" >"$DESK/Vocab 500.desktop"
chmod +x "$APPS/vocab-500.desktop" "$DESK/Vocab 500.desktop"
gio set "$DESK/Vocab 500.desktop" metadata::trusted true 2>/dev/null || true
update-desktop-database "$APPS" 2>/dev/null || true
echo "Installed: $DESK/Vocab 500.desktop and the app menu entry."
