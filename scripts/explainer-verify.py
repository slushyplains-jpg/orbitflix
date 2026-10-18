"""Automatic checks on a finished render.

Usage: python3.11 explainer-verify.py <video.mp4>
Checks: length 55-63 s, vertical 1080x1920, audio present, and no long black stretches.
Exit code 1 on any FAIL.
"""
import json
import re
import subprocess
import sys

video = sys.argv[1]
if not __import__("os").path.exists(video):
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
print(f"length {dur:.1f}s, black {sum(black):.1f}s, audio {'yes' if has_audio else 'no'}")
for f in fails:
    print("FAIL", f)
print("RESULT", "FAIL" if fails else "PASS")
sys.exit(1 if fails else 0)
