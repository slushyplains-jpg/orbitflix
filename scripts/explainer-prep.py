"""After the script is written: checks, then the voice and the footage at the same time, in one command.

Usage: python3.11 explainer-prep.py <slug>
1. Fact check and lint (a few seconds). Stops here with what to fix if either fails.
2. The voice check and the footage tool run in parallel (the voice is CPU, the footage is mostly
   network), then it prints both results and the two candidate sheets to look at.
Rerun it after any script change; it rebuilds the clip candidates (sync.json is kept).
"""
import json
import os
import re
import subprocess
import sys

slug = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
d = os.path.join(os.path.dirname(here), "notes/explainer", slug)
PY = sys.executable
script = os.path.join(d, "script.txt")
movie = json.load(open(os.path.join(d, "movie.json")))


def show(out):
    lines = [l for l in out.splitlines() if l.strip() and not l.startswith(("recorded", "not recorded"))]
    return "\n".join(re.sub(r"https?://\S+", "<link>", l) for l in lines)


for name, cmd in (("fact check", ["explainer-factcheck.py", slug]), ("lint", ["explainer-lint.py", script])):
    r = subprocess.run([PY, os.path.join(here, cmd[0]), *cmd[1:]], capture_output=True, text=True)
    out = show(r.stdout)
    if r.returncode:
        print(f"{name}: FAIL\n" + "\n".join(l for l in out.splitlines() if l.startswith(("FAIL", "WARN"))))
        sys.exit(1)
    print(f"{name}: PASS" + "".join(f"\n  {l}" for l in out.splitlines() if l.startswith("WARN")))

# A changed script means new beats and new candidates; the stream sync stays valid.
for f in ("beats.json", "picks.txt", "candidates.json", "candidates_1.jpg", "candidates_2.jpg"):
    if os.path.exists(os.path.join(d, f)):
        os.remove(os.path.join(d, f))
voice = subprocess.Popen([PY, os.path.join(here, "explainer-voicecheck.py"), script, "final"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
foot = subprocess.Popen([PY, os.path.join(here, "explainer-footage-auto.py"), slug, str(movie["tmdb"]), movie.get("kind", "movie")],
                        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
v_out, f_out = voice.communicate()[0], foot.communicate()[0]
v_lines = show(v_out).splitlines()
print("voice: " + " | ".join(l for l in v_lines if l.startswith(("voice", "PASS", "FAIL"))))
f_lines = [l for l in show(f_out).splitlines() if "frames," not in l]
print("footage: " + ("\n  ".join(f_lines[-4:]) if f_lines else "no output"))
if voice.returncode or foot.returncode:
    sys.exit(1)
print(f"look at: notes/explainer/{slug}/candidates_1.jpg and candidates_2.jpg, then edit picks.txt")
