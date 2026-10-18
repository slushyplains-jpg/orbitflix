"""Stages 7 and 8 in one command: build the job, render detached, wait, verify, and record both stages.

Usage: python3.11 explainer-finish.py <slug> <tmdb> "<Title (Year)>" [template] [movie|tv]
Stages 1 to 6 must have passed. The render runs in its own process session, so if this command is
interrupted the render keeps going; run it again with --wait-only to wait for it and verify.
Prints the output path, length and the verify result. Exit code 1 on any failure.
"""
import json
import os
import re
import subprocess
import sys
import time

args = [a for a in sys.argv[1:] if a != "--wait-only"]
wait_only = "--wait-only" in sys.argv
slug, tmdb, title = args[0], args[1], args[2]
template = args[3] if len(args) > 3 else "final"
kind = args[4] if len(args) > 4 else "movie"
here = os.path.dirname(os.path.abspath(__file__))
PY = "/usr/local/bin/python3.11"
job = os.path.expanduser(f"~/Desktop/explainer-jobs/{slug}.json")
log = job.removesuffix(".json") + ".log"


def run(*cmd):
    return subprocess.run([PY, *cmd], capture_output=True, text=True)


status = run(os.path.join(here, "explainer-status.py"), slug).stdout
if "next: render" not in status and not (wait_only and "next: render" in status):
    sys.exit(f"stages 1 to 6 must pass first:\n{status}")
if not wait_only:
    r = run(os.path.join(here, "explainer-job.py"), slug, tmdb, title, template, kind)
    if r.returncode:
        sys.exit(r.stderr or r.stdout)
    print(run(os.path.join(here, "explainer-render-start.py"), job).stdout.strip())
deadline = time.time() + 40 * 60
result = None
while time.time() < deadline:
    text = open(log).read() if os.path.exists(log) else ""
    m = re.search(r"\[runner\] done: (.+?\.mp4)", text)
    if m:
        result = m.group(1)
        break
    if "[runner] failed" in text:
        line = text[text.index("[runner] failed"):].splitlines()[0]
        sys.exit(re.sub(r"token=\S+", "token=...", line))
    time.sleep(15)
if not result:
    sys.exit("render did not finish within 40 minutes; check the log, then rerun with --wait-only")
v = run(os.path.join(here, "explainer-verify.py"), result, template)
print(v.stdout.strip())
if v.returncode:
    sys.exit(1)
length = re.search(r"length ([\d.]+)s", v.stdout).group(1)
run(os.path.join(here, "explainer-status.py"), slug, "render", f"{length}s, {os.path.basename(result)}")
run(os.path.join(here, "explainer-status.py"), slug, "verify", v.stdout.splitlines()[0])
print(f"done: {result}")
