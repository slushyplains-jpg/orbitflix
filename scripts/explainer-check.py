"""Run all story checks in order with one command: fact check, lint, voice length.

Usage: python3.11 explainer-check.py <slug>
Stops at the first check that fails and prints only what needs fixing. Each check records its own
stage when it passes. One command instead of three saves model turns, which cost more time than
the checks themselves.
"""
import os
import subprocess
import sys

slug = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
script = os.path.join(os.path.dirname(here), "notes/explainer", slug, "script.txt")
steps = [("fact check", ["explainer-factcheck.py", slug]),
         ("lint", ["explainer-lint.py", script]),
         ("voice", ["explainer-voicecheck.py", script, "final"])]
for name, cmd in steps:
    r = subprocess.run(["/usr/local/bin/python3.11", os.path.join(here, cmd[0]), *cmd[1:]], capture_output=True, text=True)
    lines = [l for l in r.stdout.splitlines() if l.strip() and not l.startswith(("recorded", "not recorded"))]
    if r.returncode:
        print(f"{name}: FAIL")
        print("\n".join(l for l in lines if l.startswith(("FAIL", "WARN")) or "words" in l))
        sys.exit(1)
    summary = next((l for l in lines if "sentences" in l or l.startswith("voice")), "")
    warns = [l for l in lines if l.startswith("WARN")]
    print(f"{name}: {lines[-1] if lines else 'PASS'}" + (f" | {summary}" if summary else ""))
    for w in warns:
        print("  " + w)
print("ALL PASS")
