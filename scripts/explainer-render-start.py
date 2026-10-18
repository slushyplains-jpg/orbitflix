"""Start a render that keeps running after the Claude session or terminal closes.

Usage: python3.11 explainer-render-start.py <job.json>
The runner gets its own process session, so closing the parent does not stop it.
Output goes to <job>.log next to the job; progress to <job>.json.status.json.
"""
import os
import subprocess
import sys

job = os.path.abspath(sys.argv[1])
project = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
log_path = job.removesuffix(".json") + ".log"
status = job + ".status.json"
if os.path.exists(status):
    os.remove(status)
with open(log_path, "w") as log:
    child = subprocess.Popen(["npx", "-y", "tsx", os.path.join(project, "scripts/explainer-runner.ts"), job],
                             cwd=project, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT,
                             start_new_session=True)
print(f"started render pid {child.pid}, log {log_path}")
