"""Automatic checks on a finished render.

Usage: python3.11 explainer-verify.py <video.mp4> [template]
Checks: length 55-63 s, vertical 1080x1920, audio present, no long black stretches, and
burned-in captions in the template's caption band (when the template has captions on).
Exit code 1 on any FAIL.
"""
import json
import os
import re
import subprocess
import sys

video = sys.argv[1]
if not os.path.exists(video):
    print("FAIL file not found:", video)
    print("RESULT FAIL")
    sys.exit(1)
info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height",
                                  "-of", "json", video], capture_output=True, text=True, check=True).stdout)
dur = float(info["format"]["duration"])
vs = [s for s in info["streams"] if s["codec_type"] == "video"]
has_audio = any(s["codec_type"] == "audio" for s in info["streams"])
fails = []
if not 55 <= dur <= 63:
    fails.append(f"length {dur:.1f}s, needs 55-63s")
if not vs or (vs[0].get("width"), vs[0].get("height")) != (1080, 1920):
    fails.append(f"frame size {vs[0].get('width') if vs else '?'}x{vs[0].get('height') if vs else '?'}, needs 1080x1920")
if not has_audio:
    fails.append("no audio track")
bd = subprocess.run(["ffmpeg", "-v", "info", "-i", video, "-vf", "blackdetect=d=1.0:pix_th=0.08", "-an", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
black = [float(x) for x in re.findall(r"black_duration:([\d.]+)", bd)]
if sum(black) > 2.0:
    fails.append(f"{sum(black):.1f}s of near-black picture across {len(black)} stretches")
tpl_path = sys.argv[2] if len(sys.argv) > 2 else "final"
if not os.path.exists(tpl_path):
    tpl_path = os.path.expanduser(f"~/Desktop/explainer-templates/{tpl_path.removesuffix('.json')}.json")
tpl = json.load(open(tpl_path, encoding="utf-8"))
cap_note = "off in template"
if tpl.get("captions"):
    import numpy as np
    # Captions are white with the active word in the caption colour. Look for that colour in a
    # band around captionY, every 2 s. Short gaps between phrases are normal, so 60% is enough.
    c = tpl.get("captionColor", "#FFD400").lstrip("#")
    cr, cg, cb = (int(c[i:i + 2], 16) for i in (0, 2, 4))
    cy = float(tpl.get("captionY", 78)) / 100
    lo, hi = int(960 * max(0.0, cy - 0.10)), int(960 * min(1.0, cy + 0.10))
    times = [t + 0.5 for t in range(1, max(2, int(dur) - 2), 2)]
    hits = 0
    for t in times:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", video, "-frames:v", "1", "-vf", "scale=540:960",
                              "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
        if len(raw) != 540 * 960 * 3:
            continue
        band = np.frombuffer(raw, np.uint8).reshape(960, 540, 3)[lo:hi].astype(int)
        near = (abs(band[..., 0] - cr) < 50) & (abs(band[..., 1] - cg) < 50) & (abs(band[..., 2] - cb) < 70)
        hits += int(near.sum() > 300)
    share = hits / len(times)
    cap_note = f"in {hits}/{len(times)} samples"
    if share < 0.6:
        fails.append(f"captions found in only {hits}/{len(times)} samples, expected most of them")
print(f"length {dur:.1f}s, black {sum(black):.1f}s, audio {'yes' if has_audio else 'no'}, captions {cap_note}")
for f in fails:
    print("FAIL", f)
print("RESULT", "FAIL" if fails else "PASS")
sys.exit(1 if fails else 0)
