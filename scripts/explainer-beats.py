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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from explainer_sync import to_stream  # noqa: E402

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
# Split the sentences, in order, into exactly CLIPS groups of one or two, choosing the pairs whose
# pictures are closest (fewest scene changes inside a clip). Dynamic programming, so it always finds
# a split for any count from CLIPS to 2 * CLIPS.
n = len(sents)
def pair_cost(i):
    pa, pb = pic_of[i], pic_of[i + 1]
    gap = abs(pa - pb) if pa is not None and pb is not None else 10**6
    return gap * 1000 + len(sents[i]) + len(sents[i + 1])
INF = float("inf")
dp = [[INF] * (CLIPS + 1) for _ in range(n + 1)]
back = [[0] * (CLIPS + 1) for _ in range(n + 1)]
dp[0][0] = 0
for i in range(n):
    for k in range(CLIPS):
        if dp[i][k] == INF:
            continue
        if dp[i][k] < dp[i + 1][k + 1]:
            dp[i + 1][k + 1], back[i + 1][k + 1] = dp[i][k], 1
        if i + 1 < n and dp[i][k] + pair_cost(i) < dp[i + 2][k + 1]:
            dp[i + 2][k + 1], back[i + 2][k + 1] = dp[i][k] + pair_cost(i), 2
groups, i, k = [], n, CLIPS
while i > 0:
    size = back[i][k]
    groups.insert(0, list(range(i - size, i)))
    i, k = i - size, k - 1

ats = [next((pic_of[i] for i in g if pic_of[i] is not None), None) for g in groups]
beats, flagged = [], []
for k, g in enumerate(groups):
    at = ats[k]
    if at is None:
        prev = next((ats[j] for j in range(k - 1, -1, -1) if ats[j] is not None), None)
        nxt = next((ats[j] for j in range(k + 1, len(ats)) if ats[j] is not None), None)
        at = ((prev or nxt or 60) + (nxt or prev or 60)) // 2
        flagged.append(k + 1)
    at = round(to_stream(slug, at))  # Picture times are subtitle time; the stream may run ahead or behind
    word = re.sub(r"[^a-z]", "", (re.findall(r"[A-Za-z]{5,}", sents[g[0]]) or ["beat"])[0].lower())
    pad = (15, 30) if k == 0 else (6, 20)  # the picture time is exact, so the window can be tight
    beats.append({"name": f"B{k + 1:02d}_{word}", "sentences": [g[0], g[-1]], "at": at, "start": max(0, at - pad[0]), "end": at + pad[1]})
if missing_pic:
    print(f"no Picture time for sentences {missing_pic}; using the cited subtitle time, which may show people talking about it instead")
json.dump(beats, open(os.path.join(d, "beats.json"), "w"), indent=1)
print(f"wrote beats.json: {len(beats)} beats" + (f"; no cited time for beats {flagged}, check them" if flagged else ""))
