"""Build the movie queue from a candidate list, keeping only movies that can be made.

Usage: python3.11 explainer-build-queue.py
Reads notes/explainer/candidates.txt (category|Title|Year per line) and the earlier
candidate-movies.csv. For each movie it asks TMDB for the id, IMDb id, runtime and vote count, and asks
OpenSubtitles whether an English SDH track exists. It keeps movies from 2000 or later with an SDH track, a runtime of 75 to
140 minutes (long films make research heavy), at least 1500 votes (people know them) and no animation.
The queue is ordered so every four movies in a row are four different categories (horror, creature,
sci-fi, thriller), most popular first inside each category, so one day's four Shorts differ. Movies
already finished stay first, marked done by their status file. Results are cached in
notes/explainer/.queue-cache.json, so reruns are fast. Also writes notes/explainer/PLAN.md.
"""
import csv
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
NOTES = os.path.join(ROOT, "notes/explainer")
CACHE = os.path.join(NOTES, ".queue-cache.json")
KEY = re.search(r"API_KEY\s*=\s*'([^']+)'", open(os.path.join(ROOT, "src/lib/tmdb.ts")).read()).group(1)
OS_HEADERS = {"X-User-Agent": "trailers.to-UA", "User-Agent": "Mozilla/5.0"}
MIN_YEAR = 2000  # the user wants nothing older
ORDER = ["horror", "creature", "scifi", "thriller"]
KEPT = [("world-war-z", "World War Z", 2013, "0816711", 72190), ("the-host", "The Host", 2006, "0468492", 1255)]


def get(url, headers=None, tries=3):
    for i in range(tries):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=headers or {}), timeout=30))
        except Exception:
            time.sleep(1.5 * (i + 1))
    return None


def tmdb(path, **params):
    q = urllib.parse.urlencode({"api_key": KEY, **params})
    return get(f"https://api.themoviedb.org/3/{path}?{q}")


def sdh_tracks(imdb):
    res = get(f"https://rest.opensubtitles.org/search/imdbid-{imdb}/sublanguageid-eng", OS_HEADERS)
    time.sleep(0.6)
    if res is None:
        return None
    return sum(1 for r in res if str(r.get("SubHearingImpaired")) == "1")


def lookup(title, year):
    res = tmdb("search/movie", query=title, year=year) or {}
    hits = [h for h in res.get("results", []) if (h.get("release_date") or "")[:4] in (str(year), str(year - 1), str(year + 1))]
    if not hits:
        return None
    hit = max(hits, key=lambda h: h.get("vote_count", 0))
    d = tmdb(f"movie/{hit['id']}", append_to_response="external_ids") or {}
    imdb = (d.get("external_ids") or {}).get("imdb_id") or ""
    return {"tmdb": d.get("id"), "imdb": imdb.replace("tt", ""), "runtime": d.get("runtime") or 0, "votes": d.get("vote_count") or 0,
            "genres": [g["name"] for g in d.get("genres", [])], "title": d.get("title"), "year": int((d.get("release_date") or "0")[:4] or 0)}


def main():
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    cands = []
    for line in open(os.path.join(NOTES, "candidates.txt"), encoding="utf-8"):
        if line.strip():
            cat, title, year = line.strip().split("|")
            cands.append((cat, title, int(year)))
    seen = {t.lower() for _, t, _ in cands}
    old = os.path.join(NOTES, "candidate-movies.csv")
    if os.path.exists(old):
        for r in csv.DictReader(open(old, encoding="utf-8-sig")):
            if r["Title"].strip().lower() not in seen:
                cands.append(("auto", r["Title"].strip(), int(r["Year"])))
    kept_imdb = {k[3] for k in KEPT}
    rows, dropped = [], []
    for i, (cat, title, year) in enumerate(cands):
        if year < MIN_YEAR:
            dropped.append((title, year, f"before {MIN_YEAR}")); continue
        key = f"{title}|{year}"
        if key not in cache:
            info = lookup(title, year)
            if info and info["imdb"]:
                info["sdh"] = sdh_tracks(info["imdb"])
            cache[key] = info
            json.dump(cache, open(CACHE, "w"))
        info = cache[key]
        if not info or not info["imdb"]:
            dropped.append((title, year, "not found on TMDB")); continue
        if info["imdb"] in kept_imdb:
            continue
        why = None
        if not info.get("sdh"):
            why = "no English SDH subtitles" if info.get("sdh") == 0 else "subtitle lookup failed"
        elif not 75 <= info["runtime"] <= 140:
            why = f"runtime {info['runtime']} min"
        elif info["votes"] < 1500:
            why = f"only {info['votes']} votes"
        elif "Animation" in info["genres"] or "Documentary" in info["genres"]:
            why = "animation or documentary"
        if why:
            dropped.append((title, year, why)); continue
        if cat == "auto":
            g = info["genres"]
            cat = "scifi" if "Science Fiction" in g else "horror" if "Horror" in g else "thriller"
        slug = re.sub(r"[^a-z0-9]+", "-", info["title"].lower()).strip("-")
        rows.append({"cat": cat, "slug": slug, "title": info["title"], "year": info["year"], "imdb": info["imdb"], "tmdb": info["tmdb"], "votes": info["votes"]})
        print(f"{i + 1}/{len(cands)} ok  {info['title']} ({info['year']}) {cat} {info['runtime']}min {info['votes']} votes {info['sdh']} SDH", flush=True)
    # drop duplicates, then interleave the categories
    uniq = {}
    for r in rows:
        uniq.setdefault(r["imdb"], r)
    pools = {c: sorted([r for r in uniq.values() if r["cat"] == c], key=lambda r: -r["votes"]) for c in ORDER}
    ordered = []
    while any(pools.values()):
        for c in ORDER:
            if pools[c]:
                ordered.append(pools[c].pop(0))
    with open(os.path.join(NOTES, "queue.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["slug", "title", "year", "imdb", "tmdb", "category"])
        for s, t, y, imdb, tm in KEPT:
            w.writerow([s, t, y, imdb, tm, "kept"])
        for r in ordered:
            w.writerow([r["slug"], r["title"], r["year"], r["imdb"], r["tmdb"], r["cat"]])
    with open(os.path.join(NOTES, "PLAN.md"), "w", encoding="utf-8") as f:
        f.write(f"# Daily plan: {len(ordered)} movies, 4 a day = {len(ordered) // 4} days\n\n")
        f.write("Every day is one horror, one creature, one sci-fi and one thriller film, most popular first. "
                "World War Z and The Host are already made.\n\n")
        for d in range(0, len(ordered), 4):
            day = ordered[d:d + 4]
            f.write(f"**Day {d // 4 + 1}:** " + " | ".join(f"{r['title']} ({r['year']})" for r in day) + "\n\n")
        f.write("## Left out\n\n" + "\n".join(f"- {t} ({y}): {why}" for t, y, why in dropped) + "\n")
    print(f"\nqueue: {len(ordered)} movies ({len(ordered) // 4} days at 4 a day); left out {len(dropped)}")


if __name__ == "__main__":
    main()
