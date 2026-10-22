"""Generate the voiceover for a script and check its length before any footage work or render.

Usage: python3.11 explainer-voicecheck.py <script.txt> [template.json]
Uses the same Kokoro TTS as the render, with the template's voice and speed.
Exit code 1 if the voice is outside 57-61 seconds.
"""
import json
import os
import subprocess
import sys
import tempfile
import wave

# A tight band keeps every Short the same feel; the estimate in the linter gets there in one try.
MIN_SEC, MAX_SEC = 57.0, 61.0
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
print(f"voice {sec:.1f}s at {speed}x ({words} words, {words / sec:.2f} words/s)")
# Small misses are fixed by speaking a little faster or slower (up to 6 percent, which nobody hears),
# not by padding or trimming words. Only big misses need the script changed.
TARGET, MAX_SHIFT = 59.0, 0.06
new_speed, verdict = speed, "PASS"
if not MIN_SEC <= sec <= MAX_SEC:
    factor = sec / TARGET
    if abs(factor - 1) <= MAX_SHIFT:
        new_speed = round(speed * factor, 3)
        verdict = f"PASS (speed set to {new_speed}x so it lands at about {TARGET:.0f}s)"
    else:
        lo, hi = TARGET * (1 - MAX_SHIFT), TARGET * (1 + MAX_SHIFT)
        if sec < lo:
            print(f"FAIL too short by {lo - sec:.1f}s even with a speed change; add about {int((lo - sec + 1.5) * words / sec) + 1} words of story (a new visible detail), not filler")
        else:
            print(f"FAIL too long by {sec - hi:.1f}s even with a speed change; cut about {int((sec - hi + 1.5) * words / sec) + 1} words, starting with the weakest sentence")
        sys.exit(1)
import hashlib  # noqa: E402
text = open(script, encoding="utf-8").read().strip()
json.dump({"speed": new_speed, "seconds_at_template_speed": round(sec, 2), "script_sha": hashlib.sha1(text.encode()).hexdigest()},
          open(os.path.join(os.path.dirname(os.path.abspath(script)), "voice.json"), "w"), indent=1)
print(verdict)
sys.path.insert(0, here)
from explainer_record import record, slug_of  # noqa: E402
record(slug_of(script), "voice", f"{sec:.1f}s at {speed}x" + ("" if new_speed == speed else f", render at {new_speed}x"))
