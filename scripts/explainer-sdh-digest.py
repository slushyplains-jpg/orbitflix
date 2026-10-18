"""Write a compact subtitle digest for research: one line per moment, tags and ads removed.

Usage: python3.11 explainer-sdh-digest.py <slug>
Writes notes/explainer/<slug>/sdh_digest.txt: "m:ss text" lines, with cues less than 2 s apart
joined into one line. It is about half the size of the .srt and keeps every spoken line and sound cue,
so research reads this instead of the raw file. Grep sdh.srt only to confirm an exact time.
"""
import os
import re
import sys

d = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "notes/explainer", sys.argv[1])
srt = open(os.path.join(d, "sdh.srt"), encoding="utf-8", errors="ignore").read()
rows = []
for block in re.split(r"\n\s*\n", srt.strip()):
    lines = block.splitlines()
    for i, line in enumerate(lines):
        m = re.match(r"(\d+):(\d+):(\d+),\d+ --> (\d+):(\d+):(\d+)", line)
        if not m:
            continue
        g = list(map(int, m.groups()))
        text = re.sub(r"<[^>]+>|\{[^}]+\}", "", " ".join(lines[i + 1:])).strip()
        if text and not re.search(r"www\.|osdb|opensubtitles|subtitles by", text, re.I):
            rows.append([g[0] * 3600 + g[1] * 60 + g[2], g[3] * 3600 + g[4] * 60 + g[5], text])
        break
merged = []
for st, en, text in rows:
    if merged and st - merged[-1][1] < 2 and len(merged[-1][2]) < 200:
        merged[-1][1], merged[-1][2] = en, merged[-1][2] + " " + text
    else:
        merged.append([st, en, text])
fmt = lambda t: f"{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}" if t >= 3600 else f"{t // 60}:{t % 60:02d}"
out = os.path.join(d, "sdh_digest.txt")
open(out, "w", encoding="utf-8").write("\n".join(f"{fmt(st)} {text}" for st, _, text in merged) + "\n")
print(f"wrote {out}: {len(merged)} lines, {os.path.getsize(out) // 1024} KB (srt {len(srt) // 1024} KB)")
