# Vocab 500

500 exam words. Each word: বাংলা and English meaning, a বাংলা memory trick, an example with its বাংলা, synonyms and opposites,
and its close words (abate / allay / alleviate / mitigate …) side by side with examples.

- **Today:** the day's study in one go: the words due for review, then the next new words in order
  (5 a day, change it in Settings). Days 1-6 of each week bring new words; once a week's words have all been started,
  the next day is Day 7: it revises that week's words and brings no new ones. After each card you say how it went: *আবার* (again, later today),
  *কঠিন* (tomorrow), *পেরেছি* (a few days), *সহজ* (a week or more). Words you know come back less and less
  often (1, 3, 7, 16, 35 days). The map shows all 500 words, one square each, one row per block.
- **Learn:** pick a week and a day (Day 7 = the whole week), or any numbers (1-10). Days follow the words-a-day
  setting: with 10 a day, Day 1 is #1-10 and Day 7 revises #1-60.
- **Quiz:** a week, a day or any numbers (1-50 …), how many questions, only the words still being learnt, close-word
  questions, word-family questions (*abate* is which part of speech? what is its noun? → *abatement*). Wrong answers come back in today's review.
- **Write sentences** (on the Quiz page): make your own sentence with each word. It checks that the word (or a form
  of it) is there and checks grammar and spelling with LanguageTool's free public API (online; about 20 checks a minute).
  With a free API key (Settings → AI check: Google Gemini from aistudio.google.com, or Groq from console.groq.com)
  an AI also judges the meaning, grammar and how natural it sounds, in Bangla and rewrites your sentence (corrected, or more polished). The examples shown are always the book's own. The key
  stays in the browser (not in the progress file). Without a key: compare with the book's example, or ask Google /
  Chrome's built-in AI. Then mark it right or wrong.
- **Close words:** the close-word groups. **Word list:** all 500, search by word, number or Bangla meaning.
- **Google** on a card searches "*word* Bangla meaning with mnemonic" in a small window beside the app.

Progress stays in the browser (localStorage). *Settings → File-এ save করো / File থেকে আনো* moves it to another device.
Keys: Space shows the meaning, 1-4 rate or pick an answer, Enter goes on, Esc stops.

## Run

No server and no packages: open `index.html` in a browser. Desktop icon (Linux):

```bash
./launcher/install-desktop.sh
```

**Phone:** put the folder on any static host (GitHub Pages, Netlify …) and open it on the phone, then
*Add to Home screen*: it installs as an app and works offline (`sw.js`; raise `V` in it after changing files).

**In the Shobdo extension:** `./tools/export_to_shobdo.sh` copies the app into `../shobdo/vocab/` (Library →
Vocab 500 tab). Run it again after any change here.

## Adding words

The numbered word list is `tools/words_book.txt`. Full entries (meaning, trick,
example, close words, fill-in sentence) for all 500: #1-10 in `tools/words_detail.js`, the rest in
`tools/detail/p*.js`. After editing:

```bash
node tools/check.js         # every entry has its fields, examples contain the word, groups are consistent
python3 tools/build.py      # → data/words.js (also merges identical close-word groups and links every word to its groups)
```

Pronunciations are saved in `audio/` (a recorded voice where the free Dictionary API has one, else Google
Translate's English voice) so they play offline: `./tools/fetch_audio.sh` fetches any that are missing.
