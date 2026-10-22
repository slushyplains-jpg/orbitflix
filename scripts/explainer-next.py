"""Pick the next movie and get it ready to write, in one command.

Usage: python3.11 explainer-next.py [slug]
Takes the first movie in notes/explainer/queue.csv that is not done (or the slug given), looks up its
TMDB id if missing, downloads English SDH subtitles if missing, writes movie.json, and builds the short
subtitle digest. Prints the movie and where it is in the pipeline. A movie with no SDH subtitles is
skipped (marked in the queue) and the next one is used.
"""
import csv
import importlib.util
import json
import os
import re
import subprocess
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
NOTES = os.path.join(ROOT, "notes/explainer")
QUEUE = os.path.join(NOTES, "queue.csv")
STAGES = ["research", "story", "lint", "voice", "footage", "render", "verify"]


def done(slug):
    p = os.path.join(NOTES, slug, "status.json")
    return os.path.exists(p) and all(s in json.load(open(p))["passed"] for s in STAGES)


def tmdb_id(imdb):
    key = re.search(r"API_KEY\s*=\s*'([^']+)'", open(os.path.join(ROOT, "src/lib/tmdb.ts")).read()).group(1)
    url = f"https://api.themoviedb.org/3/find/tt{imdb}?api_key={key}&external_source=imdb_id"
    res = json.load(urllib.request.urlopen(url, timeout=30))
    return (res.get("movie_results") or [{}])[0].get("id", "")


def main():
    rows = list(csv.DictReader(open(QUEUE, encoding="utf-8")))
    want = sys.argv[1] if len(sys.argv) > 1 else None
    spec = importlib.util.spec_from_file_location("newexp", os.path.join(HERE, "new-explainer.py"))
    newexp = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(newexp)
    for row in rows:
        slug = row["slug"]
        if (want and slug != want) or (not want and (done(slug) or row.get("tmdb") == "skip")):
            continue
        folder = os.path.join(NOTES, slug)
        os.makedirs(folder, exist_ok=True)
        if not os.path.exists(os.path.join(folder, "status.json")):
            # A fresh start: files from an older pipeline must not be mistaken for this run's.
            for f in ("story.md", "hooks.md", "script.txt", "script.md", "clips.json", "clips.md"):
                src = os.path.join(folder, f)
                if os.path.exists(src):
                    stem, ext = os.path.splitext(f)
                    n, dst = 1, os.path.join(folder, f"{stem}_old{ext}")
                    while os.path.exists(dst):
                        n, dst = n + 1, os.path.join(folder, f"{stem}_old{n}{ext}")
                    os.rename(src, dst)
        if not os.path.exists(os.path.join(folder, "sdh.srt")):
            try:
                _, text = newexp.find_sdh(row["imdb"])
            except SystemExit as e:
                print(f"skipping {row['title']}: {e}")
                row["tmdb"] = "skip"
                continue
            open(os.path.join(folder, "sdh.srt"), "w", encoding="utf-8").write(text)
        if not row.get("tmdb"):
            row["tmdb"] = str(tmdb_id(row["imdb"]))
        movie = {"slug": slug, "title": f"{row['title']} ({row['year']})", "imdb": row["imdb"], "tmdb": int(row["tmdb"]), "kind": "movie"}
        json.dump(movie, open(os.path.join(folder, "movie.json"), "w"), indent=1)
        break
    else:
        sys.exit("no movie left in the queue" if not want else f"{want} is not in the queue")
    with open(QUEUE, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["slug", "title", "year", "imdb", "tmdb"])
        w.writeheader()
        w.writerows(rows)
    subprocess.run([sys.executable, os.path.join(HERE, "explainer-sdh-digest.py"), slug], capture_output=True)
    st = subprocess.run([sys.executable, os.path.join(HERE, "explainer-status.py"), slug], capture_output=True, text=True).stdout
    size = os.path.getsize(os.path.join(folder, "sdh_digest.txt")) // 1024
    print(f"{movie['title']}  slug={slug}  tmdb={movie['tmdb']}  digest={size} KB  {st.strip().splitlines()[-1]}")


if __name__ == "__main__":
    main()
