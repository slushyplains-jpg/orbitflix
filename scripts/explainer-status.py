"""Record and show where a movie is in the pipeline, so any run can resume.

Usage:
  python3.11 explainer-status.py <slug>                    show status and the next stage
  python3.11 explainer-status.py <slug> <stage> [note]     record a stage as passed (earlier stages must have passed)
  python3.11 explainer-status.py <slug> --reset <stage>    redo from this stage: clears it and every later stage
  python3.11 explainer-status.py <slug> --accept <note>    mark every stage passed, only for a video the user has
                                                           already approved that was made before this pipeline
Stages, in order: research, story, lint, voice, footage, sheet, render, verify
"""
import datetime
import json
import os
import sys

STAGES = ["research", "story", "lint", "voice", "footage", "sheet", "render", "verify"]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(root, "notes", "explainer", sys.argv[1], "status.json")
st = json.load(open(path)) if os.path.exists(path) else {"passed": {}}
now = datetime.datetime.now().isoformat(timespec="seconds")
args = sys.argv[2:]
if args[:1] == ["--reset"]:
    stage = args[1]
    if stage not in STAGES:
        sys.exit(f"unknown stage {stage}; use one of {STAGES}")
    for s in STAGES[STAGES.index(stage):]:
        st["passed"].pop(s, None)
    st.setdefault("history", []).append({"at": now, "reset_from": stage})
    json.dump(st, open(path, "w"), indent=2)
elif args[:1] == ["--accept"]:
    note = " ".join(args[1:]) or "accepted by user"
    for s in STAGES:
        st["passed"][s] = {"at": now, "note": f"legacy: {note}"}
    json.dump(st, open(path, "w"), indent=2)
elif args:
    stage = args[0]
    if stage not in STAGES:
        sys.exit(f"unknown stage {stage}; use one of {STAGES}")
    missing = [s for s in STAGES[:STAGES.index(stage)] if s not in st["passed"]]
    if missing:
        sys.exit(f"cannot record {stage}: earlier stages not passed: {missing}")
    st["passed"][stage] = {"at": now, "note": " ".join(args[1:])}
    json.dump(st, open(path, "w"), indent=2)
nxt = next((s for s in STAGES if s not in st["passed"]), "done")
for s in STAGES:
    p = st["passed"].get(s)
    print(f"{'x' if p else ' '} {s}" + (f"  {p['at']}  {p['note']}" if p else ""))
print("next:", nxt)
