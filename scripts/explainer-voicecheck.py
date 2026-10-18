"""Generate the voiceover for a script and check its length before any footage work or render.

Usage: python3.11 explainer-voicecheck.py <script.txt> [template.json]
Uses the same Kokoro TTS as the render, with the template's voice and speed.
Exit code 1 if the voice is outside 55-63 seconds.
"""
import json
import os
import subprocess
import sys
import tempfile
import wave

MIN_SEC, MAX_SEC = 55.0, 63.0
here = os.path.dirname(os.path.abspath(__file__))
script = sys.argv[1]
tpl_path = sys.argv[2] if len(sys.argv) > 2 else "final"
# A bare name like "final" means a saved template in ~/Desktop/explainer-templates.
if not os.path.exists(tpl_path):
    tpl_path = os.path.expanduser(f"~/Desktop/explainer-templates/{tpl_path.removesuffix('.json')}.json")
tpl = json.load(open(tpl_path, encoding="utf-8"))
voice, speed = tpl.get("voice", "am_liam"), float(tpl.get("ttsSpeed", 1.0))
out = os.path.join(tempfile.mkdtemp(prefix="voicecheck_"), "voice.wav")
subprocess.run(["/usr/local/bin/python3.11", os.path.join(here, "explainer-tts.py"), script, out, voice, str(speed)],
               check=True, capture_output=True)
w = wave.open(out)
sec = w.getnframes() / w.getframerate()
words = len(open(script, encoding="utf-8").read().split())
print(f"voice {sec:.1f}s at {speed}x ({words} words, {words / sec:.2f} words/s), file {out}")
if sec < MIN_SEC:
    print(f"FAIL too short by {MIN_SEC - sec:.1f}s, add about {int((MIN_SEC - sec) * words / sec) + 1} words")
    sys.exit(1)
if sec > MAX_SEC:
    print(f"FAIL too long by {sec - MAX_SEC:.1f}s, cut about {int((sec - MAX_SEC) * words / sec) + 1} words")
    sys.exit(1)
print("PASS")
