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
story = open(os.path.join(d, "story.md"), encoding="utf-8").read() if os.path.exists(os.path.join(d, "story.md")) else ""
fields = ["Premise", "Protagonist", "Wild facts", "Human detail", "Wound", "Key beats", "Twist we can show", "Hold back", "Best images", "Cliffhanger"]
missing_fields = [f for f in fields if f"**{f}" not in story]
if missing_fields:
    fails.append(f"story.md is missing fields: {missing_fields}")
hooks_p = os.path.join(d, "hooks.md")
if not os.path.exists(hooks_p):
    fails.append("hooks.md is missing")
else:
    # The Model line proves examples.md was opened: it must be copied from it word for word.
    m = re.search(r"Model line:\s*(.+)", open(hooks_p, encoding="utf-8").read())
    ex_p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".claude/skills/explainer-story/examples.md")
    norm = lambda t: re.sub(r"\s+", " ", t.replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"')).strip(" \"'>*|")
    line = norm(m.group(1)) if m else ""
    if len(line) < 25 or line not in norm(open(ex_p, encoding="utf-8").read()):
        fails.append("hooks.md needs a last line 'Model line: ...' copied word for word from examples.md (at least 25 characters)")
md = open(os.path.join(d, "script.md"), encoding="utf-8").read()
hdr = next(([c.strip().lower() for c in l.strip().strip("|").split("|")] for l in md.splitlines() if l.startswith("| #")), [])
if "picture" not in hdr:
    fails.append("the script.md table needs a Picture column: the time each sentence's subject is on screen")
else:
    pi = hdr.index("picture")
    for l in md.splitlines():
        c = [x.strip() for x in l.strip().strip("|").split("|")] if l.startswith("|") else []
        if len(c) > pi and re.fullmatch(r"\d+(\s*-\s*\d+)?", c[0]) and not re.search(r"\d{1,2}:\d{2}", c[pi]):
            fails.append(f"sentence {c[0]} has no Picture time")
vc = md.split("## Viral check", 1)[1] if "## Viral check" in md else ""
need = ["Scroll", "Premise", "Root for", "Moments", "Ending", "Cut"]
missing_vc = [k for k in need if not re.search(rf"\b{k}\b\s*[-:]", vc)]
if missing_vc:
    fails.append(f"script.md needs a '## Viral check' section answering: {missing_vc}")
for f in fails:
    print("FAIL", f)
print("RESULT", "FAIL" if fails else "PASS")
if not fails:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from explainer_record import record
    record(slug, "research", "story.md has every field")
    record(slug, "story", f"{len(sentences)} sentences, every one sourced")
sys.exit(1 if fails else 0)
