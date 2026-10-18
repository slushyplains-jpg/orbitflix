"""Do all the mechanical footage work in one run and leave one small choice for the model.

Usage: python3.11 explainer-footage-auto.py <slug> <tmdb> [movie|tv]
Reads notes/explainer/<slug>/beats.json:
  [{"name": "B01_head", "sentences": [0, 0], "start": 1260, "end": 1300}, ...]   (14 beats, film seconds)
Then it:
  1. fetches a fresh stream link (kept in a temp file, never printed),
  2. builds the labeled grids for every beat in parallel (shots/<name>.jpg and .json, the fallback view),
  3. ranks the three best clip starts per beat (usable, bright, sharp, on a shot change),
  4. draws candidates_1.jpg and candidates_2.jpg: each beat's sentence and its candidates a, b, c, larger.
Look at the two candidate sheets, then write picks and run explainer-clips.py. Open a beat's full grid only
when none of its three candidates matches the sentence.
"""
import concurrent.futures as cf
import json
import os
import re
import subprocess
import sys
import tempfile
import functools

print = functools.partial(print, flush=True)

from PIL import Image, ImageDraw, ImageFont

slug, tmdb = sys.argv[1], sys.argv[2]
kind = sys.argv[3] if len(sys.argv) > 3 else "movie"
here = os.path.dirname(os.path.abspath(__file__))
d = os.path.join(os.path.dirname(here), "notes/explainer", slug)
shots = os.path.join(d, "shots")
os.makedirs(shots, exist_ok=True)
beats = json.load(open(os.path.join(d, "beats.json")))
sents = [s for s in re.split(r"(?<=[.!?])\s+", open(os.path.join(d, "script.txt"), encoding="utf-8").read().strip()) if s]
H = "User-Agent: Mozilla/5.0\r\nReferer: https://stellarconductornexus.com/\r\n"
PY = "/usr/local/bin/python3.11"
SPAN = 5

tmp = tempfile.mkdtemp(prefix=f"footage_{slug}_")
link_file = os.path.join(tmp, "link.txt")
print("fetching stream link")
subprocess.run([PY, os.path.join(here, "explainer-get-m3u8.py"), f"/{kind}/{tmdb}", link_file], check=True,
               stdout=subprocess.DEVNULL)
link = open(link_file).read().strip()


def grid(beat):
    wf = os.path.join(tmp, f"{beat['name']}.windows.json")
    json.dump([{k: beat[k] for k in ("name", "start", "end")}], open(wf, "w"))
    try:
        r = subprocess.run([PY, os.path.join(here, "explainer-shots.py"), link_file, wf, shots], capture_output=True,
                           text=True, timeout=300)
    except subprocess.TimeoutExpired:
        return beat["name"], 1, f"{beat['name']}: timed out after 5 minutes"
    return beat["name"], r.returncode, (r.stdout.strip() or r.stderr.strip()[-200:]).replace(link, "<link>")


print(f"building {len(beats)} grids, 4 at a time")
with cf.ThreadPoolExecutor(4) as ex:
    for name, code, msg in ex.map(grid, beats):
        print(("  " if code == 0 else "  FAILED ") + msg)


def rank(frames):
    picks = []
    for i in range(len(frames) - SPAN + 1):
        run = frames[i:i + SPAN]
        if not all(f["usable"] for f in run):
            continue
        score = sum(min(f["luma"], 90) for f in run) / SPAN + min(sum(f["sharp"] for f in run) / SPAN, 60) / 2
        score += -8 * sum(f["dim"] or f["soft"] for f in run) + (15 if run[0]["cut"] else 0)
        picks.append((score, run[0]["t"]))
    picks.sort(reverse=True)
    out = []
    for score, t in picks:
        if all(abs(t - c) >= SPAN for c in out):
            out.append(t)
        if len(out) == 3:
            break
    return out


cands = {}
for b in beats:
    p = os.path.join(shots, f"{b['name']}.json")
    cands[b["name"]] = rank(json.load(open(p))) if os.path.exists(p) else []


def still(job):
    name, k, t = job
    out = os.path.join(tmp, f"{name}_{k}.jpg")
    # A stalled stream segment can hang ffmpeg forever, so every grab has a hard time limit.
    for _ in range(2):
        try:
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-rw_timeout", "15000000", "-headers", H, "-ss", str(t + 1),
                            "-i", link, "-frames:v", "1", "-vf", "scale=360:-2", out], capture_output=True, timeout=45)
            if os.path.exists(out):
                break
        except subprocess.TimeoutExpired:
            pass
    return job, out


jobs = [(n, k, t) for n, ts in cands.items() for k, t in enumerate(ts)]
with cf.ThreadPoolExecutor(6) as ex:
    stills = {job: out for job, out in ex.map(still, jobs)}

try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
except Exception:
    font = ImageFont.load_default()
W, TH, PAD = 360, 203, 6
per_sheet = (len(beats) + 1) // 2
for sheet_no in (1, 2):
    part = beats[(sheet_no - 1) * per_sheet: sheet_no * per_sheet]
    img = Image.new("RGB", (3 * (W + PAD) + PAD, len(part) * (TH + 58) + PAD), (15, 15, 15))
    dr = ImageDraw.Draw(img)
    for r, b in enumerate(part):
        y = PAD + r * (TH + 58)
        a, z = b["sentences"]
        text = " ".join(sents[a:z + 1])
        dr.text((PAD, y), f"{b['name']}: {text[:120]}{'...' if len(text) > 120 else ''}", fill=(255, 255, 255), font=font)
        if not cands[b["name"]]:
            dr.text((PAD, y + 30), "no usable 5 s run in this window: move or widen it", fill=(255, 90, 90), font=font)
        for k, t in enumerate(cands[b["name"]]):
            x = PAD + k * (W + PAD)
            f = stills.get((b["name"], k, t))
            if f and os.path.exists(f):
                img.paste(Image.open(f).convert("RGB").resize((W, TH)), (x, y + 24))
            dr.text((x + 4, y + 26), f"{'abc'[k]}  {int(t // 60)}:{int(t % 60):02d}", fill=(255, 220, 0), font=font)
    img.save(os.path.join(d, f"candidates_{sheet_no}.jpg"), quality=85)
json.dump({n: {"abc"[k]: t for k, t in enumerate(ts)} for n, ts in cands.items()}, open(os.path.join(d, "candidates.json"), "w"), indent=1)
os.remove(link_file)
print(f"wrote candidates_1.jpg, candidates_2.jpg and candidates.json in {d}")
