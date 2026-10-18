"""Print one sheet row's values (columns D to G) built from a movie's files.

Usage: python3.11 explainer-row-values.py <slug> [ready|todo]
Prints a JSON array to pass as `values` to the Sheets update for range Sheet1!D<row>:G<row>.
Column D is script.txt, E is clips.json as compact JSON, F is empty, G is the status.
Building the row from files avoids hand-escaping JSON.
"""
import json
import os
import sys

slug = sys.argv[1]
status = "READY_FOR_LOCAL_RENDER" if (sys.argv[2] if len(sys.argv) > 2 else "ready") == "ready" else "To-do"
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
notes = os.path.join(root, "notes", "explainer", slug)
script = open(os.path.join(notes, "script.txt"), encoding="utf-8").read().strip()
clips = json.load(open(os.path.join(notes, "clips.json"), encoding="utf-8"))
print(json.dumps([[script, json.dumps(clips, separators=(",", ":"), ensure_ascii=False), "", status]], ensure_ascii=False))
