"""Check that every script sentence has a source, and that cited subtitle times are real.

Usage: python3.11 explainer-factcheck.py <slug>
script.md must hold a table whose first column is a sentence number or range (0, 4-5) and whose
last column is the source: SDH times like 3:59 or 1:02:14 (ranges "3:16 to 4:42" are fine),
and/or "plot summary". Every sentence of script.txt must be covered. Each cited SDH time must be
within 3 seconds of a subtitle cue in sdh.srt. Exit code 1 on any FAIL.
"""
import os
import re
import sys

slug = sys.argv[1]
d = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "notes/explainer", slug)
sentences = [s for s in re.split(r"(?<=[.!?])\s+", open(os.path.join(d, "script.txt"), encoding="utf-8").read().strip()) if s]
srt = open(os.path.join(d, "sdh.srt"), encoding="utf-8", errors="ignore").read()
cues = []
for m in re.finditer(r"(\d+):(\d+):(\d+),\d+ --> (\d+):(\d+):(\d+),\d+", srt):
    g = list(map(int, m.groups()))
    cues.append((g[0] * 3600 + g[1] * 60 + g[2], g[3] * 3600 + g[4] * 60 + g[5]))


def secs(t):
    p = list(map(int, t.split(":")))
    return p[0] * 60 + p[1] if len(p) == 2 else p[0] * 3600 + p[1] * 60 + p[2]


fails, covered = [], set()
for line in open(os.path.join(d, "script.md"), encoding="utf-8"):
    cells = [c.strip() for c in line.strip().strip("|").split("|")] if line.startswith("|") else []
    if len(cells) < 2 or not re.fullmatch(r"\d+(\s*-\s*\d+)?", cells[0]):
        continue
    a, _, b = cells[0].partition("-")
    nums = range(int(a), int(b or a) + 1)
    covered.update(nums)
    src = cells[-1]
    times = re.findall(r"\b\d{1,2}:\d{2}(?::\d{2})?\b", src)
    if not times and "plot" not in src.lower():
        fails.append(f"sentence {cells[0]} has no SDH time or plot summary source")
    for t in times:
        s = secs(t)
        if not any(st - 3 <= s <= en + 3 for st, en in cues):
            fails.append(f"sentence {cells[0]} cites {t}, but no subtitle is near that time")
missing = [i for i in range(len(sentences)) if i not in covered]
if missing:
    fails.append(f"sentences with no row in script.md: {missing}")
print(f"{len(sentences)} sentences, {len(covered & set(range(len(sentences))))} covered")
for f in fails:
    print("FAIL", f)
story = open(os.path.join(d, "story.md"), encoding="utf-8").read() if os.path.exists(os.path.join(d, "story.md")) else ""
fields = ["Logline", "Protagonist", "Wound", "The choice", "Human detail", "Goal and stakes", "Central mystery", "Key beats", "Turn", "Hold back", "Best images", "Cliffhanger"]
missing_fields = [f for f in fields if f"**{f}" not in story]
if missing_fields:
    fails.append(f"story.md is missing fields: {missing_fields}")
for need in ("hooks.md", "spine.md", "cold_read.md", "drafts/draft_a.txt", "drafts/draft_b.txt", "drafts/draft_c.txt"):
    if not os.path.exists(os.path.join(d, need)):
        fails.append(f"{need} is missing (spine, three drafts and a cold read are part of the story stage)")
cr = os.path.join(d, "cold_read.md")
if os.path.exists(cr) and not re.search(r"Chosen:\s*\**\s*[ABC]", open(cr, encoding="utf-8").read()):
    fails.append("cold_read.md needs a line 'Chosen: A', 'Chosen: B' or 'Chosen: C'")
print("RESULT", "FAIL" if fails else "PASS")
if not fails:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from explainer_record import record
    record(slug, "research", "story.md has every field")
    record(slug, "story", f"{len(sentences)} sentences, every one sourced")
sys.exit(1 if fails else 0)
