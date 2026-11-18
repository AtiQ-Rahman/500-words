#!/usr/bin/env bash
# Copies Vocab 500 into the Shobdo Chrome extension (its Library → "Vocab 500" tab), so there is one source:
# edit here, then run this. Also writes vocab/list.js, the 500 words alone, for Shobdo's meaning popup.
#   ./tools/export_to_shobdo.sh [path/to/shobdo]     (default: ../shobdo next to this folder)
set -e
SRC="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
EXT="$(cd "${1:-$SRC/../shobdo}" 2>/dev/null && pwd)" || true
[ -n "$EXT" ] && [ -f "$EXT/manifest.json" ] || { echo "No Shobdo extension at ${1:-$SRC/../shobdo}"; exit 1; }
DST="$EXT/vocab"
python3 "$SRC/tools/build.py" >/dev/null
rm -rf "$DST" && mkdir -p "$DST/data" "$DST/audio"
cp "$SRC/index.html" "$SRC/app.js" "$SRC/style.css" "$SRC/icon.svg" "$DST/"
cp "$SRC/data/words.js" "$SRC/data/audio.js" "$DST/data/"
cp "$SRC"/audio/*.mp3 "$DST/audio/"
# the extension page doesn't need the phone-app files
sed -i '/rel="manifest"/d;/apple-touch-icon/d' "$DST/index.html"
python3 - "$SRC/data/words.js" "$DST/list.js" <<'EOF'
import json, re, sys
wl = json.loads(re.search(r"const VWL=(\[.*?\]);", open(sys.argv[1], encoding="utf-8").read()).group(1))
open(sys.argv[2], "w", encoding="utf-8").write(
    "// made by vocab-500/tools/export_to_shobdo.sh: the 500 book words, in order, for the meaning popup\n"
    "globalThis.SHOBDO_V500 = " + json.dumps(wl) + ";\n")
EOF
echo "Copied Vocab 500 to $DST ($(ls "$DST/audio" | wc -l) sounds)"
