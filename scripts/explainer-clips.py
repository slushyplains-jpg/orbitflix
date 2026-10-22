"""Turn picked candidates into clips.json, then run the plan gate and regenerate clips.md.

Usage: python3.11 explainer-clips.py <slug>
Reads notes/explainer/<slug>/picks.txt, one line per beat in beats.json order:
  B01_head b | the statue's head lying in a street at night
  B07_tail 1687 | people screaming on a bridge as cables snap      (a time from the full grid)
The text after | is what the chosen frame shows. Quotes come from the subtitles automatically.
"""
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from explainer_sync import to_sdh  # noqa: E402

slug = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
d = os.path.join(os.path.dirname(here), "notes/explainer", slug)
beats = {b["name"]: b for b in json.load(open(os.path.join(d, "beats.json")))}
cands = json.load(open(os.path.join(d, "candidates.json")))
srt = re.sub(r"<[^>]+>", "", open(os.path.join(d, "sdh.srt"), encoding="utf-8", errors="ignore").read())
cues = []
for block in re.split(r"\n\s*\n", srt.strip()):
    lines = block.splitlines()
    for i, line in enumerate(lines):
        m = re.match(r"(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)", line)
        if m:
            g = list(map(int, m.groups()))
            cues.append((g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000, g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000, " ".join(lines[i + 1:]).strip()))
            break
clips = []
for line in open(os.path.join(d, "picks.txt"), encoding="utf-8"):
    if not line.strip():
        continue
    head, _, action = line.partition("|")
    name, choice = head.split()
    if name not in beats:
        sys.exit(f"unknown beat {name}")
    if choice in ("a", "b", "c"):
        if choice not in cands.get(name, {}):
            sys.exit(f"{name} has no candidate {choice}; pick another letter or a time from shots/{name}.jpg")
        start = float(cands[name][choice])
    elif ":" in choice:  # 53:40 or 1:02:14
        parts = [float(x) for x in choice.split(":")]
        start = parts[0] * 60 + parts[1] if len(parts) == 2 else parts[0] * 3600 + parts[1] * 60 + parts[2]
    elif choice == "NONE":
        sys.exit(f"{name} has no candidates; write a time from shots/{name}.jpg instead of NONE")
    else:
        start = float(choice)
    sub_t = to_sdh(slug, start)  # clip starts are stream time; the subtitles may be offset
    quote = next((x for a, b, x in cues if a <= sub_t + 0.5 and b >= sub_t), "")
    clips.append({"start": start, "sentences": beats[name]["sentences"], "quote": quote, "action": action.strip(),
                  "visual_prompt": action.strip(), "needs_visual_scan": False})
json.dump(clips, open(os.path.join(d, "clips.json"), "w"), indent=1)
print(f"wrote clips.json with {len(clips)} clips")
r = subprocess.run(["/usr/local/bin/python3.11", os.path.join(here, "explainer-lint.py"), os.path.join(d, "script.txt"), os.path.join(d, "clips.json")])
if r.returncode == 0:
    subprocess.run(["/usr/local/bin/python3.11", os.path.join(here, "explainer-notes.py"), slug], stdout=subprocess.DEVNULL)
    sys.path.insert(0, here)
    from explainer_record import record
    record(slug, "footage", f"{len(clips)} clips from picks.txt")
sys.exit(r.returncode)
