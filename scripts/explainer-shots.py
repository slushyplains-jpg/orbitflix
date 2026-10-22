"""Build labeled shot grids for candidate windows, with dark and blurry frames flagged.

Usage: python3.11 explainer-shots.py <link.txt> <windows.json> <outdir>
windows.json: [{"name": "S03_bridge", "start": 1700, "end": 1740}, ...]  (seconds, film time)
For each window it writes <outdir>/<name>.jpg (one frame per second, each labeled with its
film time) and <outdir>/<name>.json (per frame: time, brightness, sharpness, usable, cut).
A frame is unusable (red) only when it is near-black. Dim frames (common in horror) and soft
frames (motion blur, or a close-up with a soft background) are labeled DIM or SOFT in yellow:
usable, but check them and prefer a cleaner option when one exists.
A cut marks the first frame after a shot change, so a clip start can sit at the top of a shot.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFont

LUMA_MIN, LUMA_DIM, SHARP_SOFT = 18.0, 35.0, 12.0
H = "User-Agent: Mozilla/5.0\r\nReferer: https://stellarconductornexus.com/\r\n"
FAST = "--fast" in sys.argv
sys.argv = [a for a in sys.argv if a != "--fast"]
link = open(sys.argv[1]).read().strip()
windows = json.load(open(sys.argv[2]))
outdir = sys.argv[3]
os.makedirs(outdir, exist_ok=True)
try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 15)
except Exception:
    font = ImageFont.load_default()


def stats(path):
    g = np.asarray(Image.open(path).convert("L"), dtype=np.float32)
    rows = np.where(g.mean(axis=1) > 12)[0]  # drop letterbox bars before measuring
    if len(rows) > 10:
        g = g[rows[0]:rows[-1] + 1]
    lap = g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:] - 4 * g[1:-1, 1:-1]
    return float(g.mean()), float(lap.var())


for w in windows:
    s, e, name = float(w["start"]), float(w["end"]), w["name"]
    tmp = tempfile.mkdtemp(prefix="shots_")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-rw_timeout", "20000000", "-headers", H, "-ss", str(s), "-t", str(e - s), "-i", link,
                    "-vf", "fps=1,scale=240:-2", os.path.join(tmp, "f_%04d.jpg")], check=True)
    files = sorted(f for f in os.listdir(tmp) if f.endswith(".jpg"))
    # Shot changes from ffmpeg's scene detection on every frame, not on the 1 fps samples.
    if FAST:
        # --fast: a big change between neighbouring 1 fps frames marks a cut. It saves a second
        # full decode of the window and is close enough for choosing where a clip starts.
        cuts, prev = [], None
        for k, f in enumerate(files):
            cur = np.asarray(Image.open(os.path.join(tmp, f)).convert("L").resize((64, 36)), dtype=np.float32)
            if prev is not None and np.abs(cur - prev).mean() > 28:
                cuts.append(k - 0.5)
            prev = cur
    else:
        sc = subprocess.run(["ffmpeg", "-v", "info", "-rw_timeout", "20000000", "-headers", H, "-ss", str(s), "-t", str(e - s), "-i", link,
                             "-vf", "scale=320:-2,select='gt(scene,0.25)',showinfo", "-an", "-f", "null", "-"],
                            capture_output=True, text=True).stderr
        cuts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", sc)]
    frames = []
    for k, f in enumerate(files):
        p = os.path.join(tmp, f)
        luma, sharp = stats(p)
        cut = any(k - 1 < c <= k for c in cuts)
        frames.append({"t": round(s + k, 2), "luma": round(luma, 1), "sharp": round(sharp, 1),
                       "usable": luma >= LUMA_MIN, "dim": luma < LUMA_DIM, "soft": sharp < SHARP_SOFT,
                       "cut": cut, "file": p})
    cols = 8
    tw = 240
    th = Image.open(frames[0]["file"]).size[1] if frames else 135
    rows = (len(frames) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (tw + 4) + 4, rows * (th + 22) + 30), (15, 15, 15))
    d = ImageDraw.Draw(sheet)
    d.text((6, 6), f"{name}  {int(s // 60)}:{s % 60:04.1f} to {int(e // 60)}:{e % 60:04.1f}  (red = too dark, yellow = dim or soft, | = shot change)",
           fill=(255, 255, 255), font=font)
    for k, fr in enumerate(frames):
        x, y = 4 + (k % cols) * (tw + 4), 30 + (k // cols) * (th + 22)
        im = Image.open(fr["file"]).convert("RGB")
        im.thumbnail((tw, th))
        sheet.paste(im, (x, y))
        t = fr["t"]
        tags = [] if fr["usable"] else ["DARK"]
        if fr["usable"] and fr["dim"]:
            tags.append("DIM")
        if fr["usable"] and fr["soft"]:
            tags.append("SOFT")
        label = f"{'| ' if fr['cut'] else ''}{int(t // 60)}:{t % 60:04.1f}  {' '.join(tags)}"
        color = (255, 80, 80) if not fr["usable"] else ((255, 210, 60) if tags else (255, 255, 255))
        d.text((x + 2, y + th + 3), label, fill=color, font=font)
    sheet.save(os.path.join(outdir, f"{name}.jpg"), quality=88)
    for fr in frames:
        fr.pop("file")
    json.dump(frames, open(os.path.join(outdir, f"{name}.json"), "w"), indent=1)
    usable = sum(f["usable"] for f in frames)
    print(f"{name}: {len(frames)} frames, {usable} usable, {sum(f['cut'] for f in frames)} shot changes")
