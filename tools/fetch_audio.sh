#!/usr/bin/env bash
# Pronunciations for the 500 words, saved in audio/<word>.mp3 so they play offline.
# First choice: a real recording (Wiktionary / Wikimedia Commons) from the free Dictionary API, American, then
# British, then any accent. Words without one: Google Translate's English voice. Words already saved are skipped.
# Then writes data/audio.js with the words that have a file.
#   ./tools/fetch_audio.sh
cd "$(dirname "$(readlink -f "$0")")/.." || exit 1
mkdir -p audio
UA="vocab-app/1.0"
words=$(grep -E '^#[0-9]+-[0-9]+:' tools/words_book.txt | sed 's/^[^:]*: *//' | tr ',' '\n' | sed 's/^ *//;s/ *$//' | tr 'A-Z' 'a-z' | grep -v '^$')
rec=0 tts=0 none=""
# a real sound file (a server may answer with a web page instead)
isaudio() { [ -s "$1" ] && file -b "$1" | grep -qiE 'audio|mpeg|ID3'; }
# files saved earlier that are not sound: fetch them again
for f in audio/*.mp3; do [ -e "$f" ] && ! isaudio "$f" && rm -f "$f"; done
for w in $words; do
  f="audio/$w.mp3"
  [ -s "$f" ] && continue
  urls=$(curl -s -m 20 -A "$UA" "https://api.dictionaryapi.dev/api/v2/entries/en/$w" | grep -o '"audio":"https[^"]*\.mp3"' | sed 's/"audio":"//;s/"$//')
  u=$(printf '%s\n' "$urls" | grep -- '-us\.mp3$' | head -1)
  [ -z "$u" ] && u=$(printf '%s\n' "$urls" | grep -- '-uk\.mp3$' | head -1)
  [ -z "$u" ] && u=$(printf '%s\n' "$urls" | grep '\.mp3$' | head -1)
  if [ -n "$u" ] && curl -sL -m 30 -A "$UA" -o "$f" "$u" && isaudio "$f"; then rec=$((rec+1))
  elif curl -s -m 30 -A "Mozilla/5.0" -o "$f" "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-US&q=$w" && isaudio "$f"; then tts=$((tts+1))
  else rm -f "$f"; none="$none $w"; fi
  sleep 0.2
done
{
  echo "'use strict';"
  echo "// made by tools/fetch_audio.sh: words that have a pronunciation file in audio/"
  printf 'const AUDIO=new Set(['
  ls audio/*.mp3 2>/dev/null | sed 's|audio/||;s|\.mp3$||' | sed 's/.*/"&"/' | paste -sd, -
  echo ']);'
} > data/audio.js
echo "new recordings: $rec, new voice files: $tts, none:${none:- -}"
echo "total files: $(ls audio/*.mp3 2>/dev/null | wc -l)"
