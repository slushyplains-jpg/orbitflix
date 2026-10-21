"""Build beats.json from the script and its fact check, so the footage stage needs no subtitle search.

Usage: python3.11 explainer-beats.py <slug>
Groups the script's sentences into 14 beats (each one or two sentences, in order; the shortest
neighbouring pairs are merged first) and takes each beat's moment ("at") from the first SDH time
cited for its sentences in script.md. A beat with no cited time gets a time between its neighbours
and is flagged, so it can be checked on the candidate sheet.
"""
import json
import os
import re
import sys

CLIPS = 14
slug = sys.argv[1]
d = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "notes/explainer", slug)
sents = [s for s in re.split(r"(?<=[.!?])\s+", open(os.path.join(d, "script.txt"), encoding="utf-8").read().strip()) if s]


def secs(t):
    p = list(map(int, t.split(":")))
    return p[0] * 60 + p[1] if len(p) == 2 else p[0] * 3600 + p[1] * 60 + p[2]


cited, picture = {}, {}
header = None
for line in open(os.path.join(d, "script.md"), encoding="utf-8"):
    cells = [c.strip() for c in line.strip().strip("|").split("|")] if line.startswith("|") else []
    if cells and cells[0] == "#":
        header = [c.lower() for c in cells]
        continue
    if len(cells) < 2 or not re.fullmatch(r"\d+(\s*-\s*\d+)?", cells[0]):
        continue
    a, _, b = cells[0].partition("-")
    times = re.findall(r"\b\d{1,2}:\d{2}(?::\d{2})?\b", cells[-1])
    pic = None
    if header and "picture" in header and header.index("picture") < len(cells):
        pt = re.findall(r"\b\d{1,2}:\d{2}(?::\d{2})?\b", cells[header.index("picture")])
        pic = secs(pt[0]) if pt else None
    for i in range(int(a), int(b or a) + 1):
        if pic is not None:
            picture[i] = pic
        if times and i not in cited:
            cited[i] = secs(times[0])

if len(sents) < CLIPS or len(sents) > 2 * CLIPS:
    sys.exit(f"{len(sents)} sentences cannot make {CLIPS} beats of one or two sentences")
# Where each sentence is SHOWN. The Picture column is the time the thing is on screen; a cited
# subtitle time is only when someone talks about it, so it is a weak fallback.
pic_of = {i: picture.get(i, cited.get(i)) for i in range(len(sents))}
missing_pic = [i for i in range(len(sents)) if i not in picture]
groups = [[i] for i in range(len(sents))]
while len(groups) > CLIPS:
    # Merge the two neighbouring sentences whose pictures are closest, so a clip never has to
    # show two different scenes. Shorter pairs win ties.
    best = None
    for k, (g, h) in enumerate(zip(groups, groups[1:])):
        if len(g) == 1 and len(h) == 1:
            pa, pb = pic_of[g[0]], pic_of[h[0]]
            gap = abs(pa - pb) if pa is not None and pb is not None else 10**6
            key = (gap, len(sents[g[0]]) + len(sents[h[0]]))
            if best is None or key < best[0]:
                best = (key, k)
    k = best[1]
    groups[k:k + 2] = [groups[k] + groups[k + 1]]

ats = [next((pic_of[i] for i in g if pic_of[i] is not None), None) for g in groups]
beats, flagged = [], []
for k, g in enumerate(groups):
    at = ats[k]
    if at is None:
        prev = next((ats[j] for j in range(k - 1, -1, -1) if ats[j] is not None), None)
        nxt = next((ats[j] for j in range(k + 1, len(ats)) if ats[j] is not None), None)
        at = ((prev or nxt or 60) + (nxt or prev or 60)) // 2
        flagged.append(k + 1)
    word = re.sub(r"[^a-z]", "", (re.findall(r"[A-Za-z]{5,}", sents[g[0]]) or ["beat"])[0].lower())
    pad = (15, 30) if k == 0 else (6, 20)  # the picture time is exact, so the window can be tight
    beats.append({"name": f"B{k + 1:02d}_{word}", "sentences": [g[0], g[-1]], "at": at, "start": max(0, at - pad[0]), "end": at + pad[1]})
if missing_pic:
    print(f"no Picture time for sentences {missing_pic}; using the cited subtitle time, which may show people talking about it instead")
json.dump(beats, open(os.path.join(d, "beats.json"), "w"), indent=1)
print(f"wrote beats.json: {len(beats)} beats" + (f"; no cited time for beats {flagged}, check them" if flagged else ""))
