"""Rank clip start candidates in each shot window, from the numbers explainer-shots.py saved.

Usage: python3.11 explainer-suggest.py <shots-dir> [clip-seconds]
For every <name>.json it prints the three best starts: the next few seconds must all be usable
(not near-black), and brighter, sharper starts that sit on a shot change score higher.
It knows nothing about what is in the picture. Always look at the grid to confirm the frame
matches the sentence before using a suggestion.
"""
import glob
import json
import os
import sys

shots = sys.argv[1]
span = int(sys.argv[2]) if len(sys.argv) > 2 else 5


def mmss(t):
    return f"{int(t // 60)}:{int(t % 60):02d}"


for path in sorted(glob.glob(os.path.join(shots, "*.json"))):
    frames = json.load(open(path))
    picks = []
    for i in range(len(frames) - span + 1):
        run = frames[i:i + span]
        if not all(f["usable"] for f in run):
            continue
        score = sum(min(f["luma"], 90) for f in run) / span
        score += min(sum(f["sharp"] for f in run) / span, 60) / 2
        score -= 8 * sum(f["dim"] or f["soft"] for f in run)
        score += 15 if run[0]["cut"] else 0
        picks.append((score, run[0]["t"]))
    picks.sort(reverse=True)
    chosen = []
    for score, t in picks:
        if all(abs(t - c) >= span for _, c in chosen):  # spread the options out
            chosen.append((score, t))
        if len(chosen) == 3:
            break
    name = os.path.basename(path)[:-5]
    if not chosen:
        print(f"{name}: no {span}s run of usable frames; widen or move the window")
    else:
        print(f"{name}: " + ", ".join(f"{t:g} ({mmss(t)}, score {s:.0f})" for s, t in chosen))
