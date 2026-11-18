#!/usr/bin/env python3
"""Build data/words.js from the book list (tools/words_book.txt) and the written entries (tools/words_detail.js).

    python3 tools/build.py
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(BASE, "tools", "words_book.txt")
DETAIL = os.path.join(BASE, "tools", "words_detail.js")
OUT = os.path.join(BASE, "data", "words.js")


def book_words():
    words = {}
    pat = re.compile(r"^#(\d+)-(\d+):\s*(.+)$")
    with open(BOOK, encoding="utf-8") as f:
        for line in f:
            m = pat.match(line.strip())
            if not m:
                continue
            a, b = int(m.group(1)), int(m.group(2))
            ws = [w.strip().lower() for w in m.group(3).split(",") if w.strip()]
            if len(ws) != b - a + 1:
                raise SystemExit(f"#{a}-{b} has {len(ws)} words")
            for i, w in enumerate(ws):
                if a + i in words:
                    raise SystemExit(f"#{a + i} is listed twice")
                words[a + i] = w
    n = max(words)
    missing = [i for i in range(1, n + 1) if i not in words]
    if missing:
        raise SystemExit(f"missing numbers: {missing}")
    wl = [words[i] for i in range(1, n + 1)]
    dup = {w for w in wl if wl.count(w) > 1}
    if dup:
        raise SystemExit(f"words listed twice: {sorted(dup)}")
    return wl


# The parts were written separately, so: two groups with exactly the same words keep only the first, and every
# word of the list that a group names shows that group on its card.
TIDY = """
(()=>{const seen={},drop={};
for(const g of Object.keys(WD_CONF)){const k=WD_CONF[g].w.map(x=>x.w).sort().join(',');if(seen[k]){drop[g]=seen[k];delete WD_CONF[g]}else seen[k]=g}
for(const n in WD_DETAIL){const d=WD_DETAIL[n];d.cf=[...new Set((d.cf||[]).map(g=>drop[g]||g).filter(g=>WD_CONF[g]))]}
for(const g in WD_CONF)WD_CONF[g].w.forEach(x=>{const d=WD_DETAIL[VWL.indexOf(x.w)+1];if(d&&!d.cf.includes(g))d.cf.push(g)})})();
"""


def main():
    wl = book_words()
    with open(DETAIL, encoding="utf-8") as f:
        detail = f.read()
    # the rest of the entries, written in parts: tools/detail/*.js (Object.assign onto WD_DETAIL / WD_CONF)
    parts = os.path.join(BASE, "tools", "detail")
    for name in sorted(os.listdir(parts)) if os.path.isdir(parts) else []:
        if name.endswith(".js"):
            with open(os.path.join(parts, name), encoding="utf-8") as f:
                detail += "\n" + f.read()
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("'use strict';\n// made by tools/build.py - edit tools/words_book.txt or tools/words_detail.js, then run it again\n")
        f.write("const VWL=" + json.dumps(wl) + ";\n")
        f.write(detail)
        f.write(TIDY)
    print(f"{len(wl)} words → {OUT}")


if __name__ == "__main__":
    main()
