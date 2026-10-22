"""Do all the mechanical footage work in one run and leave one small choice for the model.

Usage: python3.11 explainer-footage-auto.py <slug> <tmdb> [movie|tv]
Reads notes/explainer/<slug>/beats.json:
  [{"name": "B01_head", "sentences": [0, 0], "at": 1281, "start": 1265, "end": 1300}, ...]   (14 beats, film seconds)
  "at" is the subtitle or plot time of the moment the sentence describes. Candidates near it rank higher,
  because the brightest shot in a window is often not the one the sentence is about.
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
import time
import functools

print = functools.partial(print, flush=True)

from PIL import Image, ImageDraw, ImageFont

slug, tmdb = sys.argv[1], sys.argv[2]
kind = sys.argv[3] if len(sys.argv) > 3 else "movie"
here = os.path.dirname(os.path.abspath(__file__))
d = os.path.join(os.path.dirname(here), "notes/explainer", slug)
shots = os.path.join(d, "shots")
os.makedirs(shots, exist_ok=True)
sents = [s for s in re.split(r"(?<=[.!?])\s+", open(os.path.join(d, "script.txt"), encoding="utf-8").read().strip()) if s]
H = "User-Agent: Mozilla/5.0\r\nReferer: https://stellarconductornexus.com/\r\n"
PY = "/usr/local/bin/python3.11"
SPAN = 5

tmp = tempfile.mkdtemp(prefix=f"footage_{slug}_")
# The link is cached outside the project (tokens never go in notes/) and reused by the render,
# so one movie opens the headless browser once. Stream tokens last about four hours; reuse for three.
cache_dir = os.path.expanduser("~/Desktop/explainer-jobs/.links")
os.makedirs(cache_dir, mode=0o700, exist_ok=True)
link_file = os.path.join(cache_dir, f"{kind}-{tmdb}.txt")
fresh = os.path.exists(link_file) and time.time() - os.path.getmtime(link_file) < 3 * 3600
if fresh and subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-m", "20", "-H", "User-Agent: Mozilla/5.0",
                             "-H", "Referer: https://stellarconductornexus.com/", open(link_file).read().strip()],
                            capture_output=True, text=True).stdout.startswith("2"):
    print("reusing cached stream link")
else:
    print("fetching stream link")
    subprocess.run([PY, os.path.join(here, "explainer-get-m3u8.py"), f"/{kind}/{tmdb}", link_file], check=True,
                   stdout=subprocess.DEVNULL)
    os.chmod(link_file, 0o600)
link = open(link_file).read().strip()


def scrub(msg):
    # Never let a signed stream link reach the console or a log.
    return re.sub(r"token=\S+", "token=...", re.sub(r"https?://\S+", "<link>", msg.replace(link, "<link>")))


if not os.path.exists(os.path.join(d, "sync.json")):
    # Subtitle times can drift from the stream (another release, frame rate or intro); measure it once.
    print("syncing subtitles to the stream (about a minute)")
    r = subprocess.run([PY, os.path.join(here, "explainer_sync.py"), slug, link_file], capture_output=True, text=True)
    print(scrub(r.stdout.strip() or r.stderr.strip()[-300:]))
if not os.path.exists(os.path.join(d, "beats.json")):
    # Beats come from the Picture times in script.md, converted to stream time with sync.json.
    r = subprocess.run([PY, os.path.join(here, "explainer-beats.py"), slug], capture_output=True, text=True)
    print(scrub(r.stdout.strip() or r.stderr.strip()[-300:]))
    if r.returncode:
        sys.exit("could not build beats.json")
beats = json.load(open(os.path.join(d, "beats.json")))


def grid(beat):
    wf = os.path.join(tmp, f"{beat['name']}.windows.json")
    json.dump([{k: beat[k] for k in ("name", "start", "end")}], open(wf, "w"))
    try:
        r = subprocess.run([PY, os.path.join(here, "explainer-shots.py"), link_file, wf, shots, "--fast"], capture_output=True,
                           text=True, timeout=300)
    except subprocess.TimeoutExpired:
        return beat["name"], 1, f"{beat['name']}: timed out after 5 minutes"
    return beat["name"], r.returncode, scrub(r.stdout.strip() or r.stderr.strip()[-200:])


print(f"building {len(beats)} grids, 4 at a time")
with cf.ThreadPoolExecutor(4) as ex:
    for name, code, msg in ex.map(grid, beats):
        print(("  " if code == 0 else "  FAILED ") + msg)


def rank(frames, at=None, dark_ok=0, near=2.5):
    picks = []
    for i in range(len(frames) - SPAN + 1):
        run = frames[i:i + SPAN]
        # The first frame must always be usable; dark films may allow a dark frame later in the run.
        if not run[0]["usable"] or sum(not f["usable"] for f in run) > dark_ok:
            continue
        score = sum(min(f["luma"], 90) for f in run) / SPAN + min(sum(f["sharp"] for f in run) / SPAN, 60) / 2
        score += -8 * sum(f["dim"] or f["soft"] for f in run) + (15 if run[0]["cut"] else 0)
        if at is not None:
            score -= near * abs(run[0]["t"] - at)  # about 10 points lost per 4 s away from the moment
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
    frames = json.load(open(p)) if os.path.exists(p) else []
    # Dark scenes rarely give 5 clean seconds, so relax step by step rather than give no candidates.
    # The hook clip is what stops the scroll, so beat 1 cares more about a striking frame than exact timing.
    near = 0.8 if b is beats[0] else 2.5
    cands[b["name"]] = rank(frames, b.get("at"), 0, near) or rank(frames, b.get("at"), 1, near) or rank(frames, b.get("at"), 2, near)


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
W, TH, PAD = 300, 169, 6
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
            dr.text((PAD, y + 30), "no candidates here: open this beat's grid in shots/ and write a time in picks.txt", fill=(255, 90, 90), font=font)
        for k, t in enumerate(cands[b["name"]]):
            x = PAD + k * (W + PAD)
            f = stills.get((b["name"], k, t))
            if f and os.path.exists(f):
                img.paste(Image.open(f).convert("RGB").resize((W, TH)), (x, y + 24))
            dr.text((x + 4, y + 26), f"{'abc'[k]}  {int(t // 60)}:{int(t % 60):02d}", fill=(255, 220, 0), font=font)
    img.save(os.path.join(d, f"candidates_{sheet_no}.jpg"), quality=85)
json.dump({n: {"abc"[k]: t for k, t in enumerate(ts)} for n, ts in cands.items()}, open(os.path.join(d, "candidates.json"), "w"), indent=1)
picks = os.path.join(d, "picks.txt")
with open(picks, "w", encoding="utf-8") as f:
    # Default: candidate a for every beat. Only lines whose picture does not fit need changing.
    for b in beats:
        a, z = b["sentences"]
        f.write(f"{b['name']} {'a' if cands[b['name']] else 'NONE'} | {' '.join(sents[a:z + 1])[:90]}\n")
print(f"wrote candidates_1.jpg, candidates_2.jpg, candidates.json and default picks.txt in {d}")
