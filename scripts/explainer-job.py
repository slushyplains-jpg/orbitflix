"""Build a render job file from a movie's notes and a template. No hand-written job JSON.

Usage: python3.11 explainer-job.py <slug> <tmdb_id> "<Title (Year)>" [template] [movie|tv]
Reads notes/explainer/<slug>/script.txt and clips.json, and ~/Desktop/explainer-templates/<template>.json.
Writes ~/Desktop/explainer-jobs/<slug>.json and prints its path.
"""
import json
import os
import sys

slug, tmdb, title = sys.argv[1], int(sys.argv[2]), sys.argv[3]
template = sys.argv[4] if len(sys.argv) > 4 else "final"
media = sys.argv[5] if len(sys.argv) > 5 else "movie"
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
notes = os.path.join(root, "notes", "explainer", slug)
tpl = json.load(open(os.path.expanduser(f"~/Desktop/explainer-templates/{template}.json"), encoding="utf-8"))
job = {k: v for k, v in tpl.items() if k != "sheetUrl"}
if isinstance(job.get("zoom"), str):
    job["zoom"] = float(job["zoom"])
job.update(
    title=title, tmdbId=tmdb, mediaType=media,
    script=open(os.path.join(notes, "script.txt"), encoding="utf-8").read().strip(),
    clips=json.load(open(os.path.join(notes, "clips.json"), encoding="utf-8")),
)
vj = os.path.join(notes, "voice.json")
if os.path.exists(vj):
    import hashlib
    v = json.load(open(vj))
    if v.get("script_sha") == hashlib.sha1(job["script"].encode()).hexdigest():
        job["ttsSpeed"] = v["speed"]
        if v.get("wav") and os.path.exists(v["wav"]):
            job["voiceWav"] = v["wav"]  # the render reuses the checked narration
    else:
        print("warning: script changed after the voice check; rerun it so the length is right", file=sys.stderr)
out_dir = os.path.expanduser("~/Desktop/explainer-jobs")
os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, f"{slug}.json")
json.dump(job, open(out, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print(out)
