import gzip
import json
import os
import re
import sys
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
NOTES = os.path.join(HERE, "..", "notes", "explainer")
HEADERS = {"X-User-Agent": "trailers.to-UA", "User-Agent": "Mozilla/5.0"}


def find_sdh(imdb_id):
    url = f"https://rest.opensubtitles.org/search/imdbid-{imdb_id}/sublanguageid-eng"
    req = urllib.request.Request(url, headers=HEADERS)
    results = json.load(urllib.request.urlopen(req, timeout=30))
    sdh = [r for r in results if str(r.get("SubHearingImpaired")) == "1"]
    if not sdh:
        raise SystemExit(f"No SDH English track found for {imdb_id}")
    best = max(sdh, key=lambda r: int(r.get("SubDownloadsCnt", 0)))
    raw = urllib.request.urlopen(urllib.request.Request(best["SubDownloadLink"], headers=HEADERS), timeout=60).read()
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    text = raw.decode("utf-8", errors="ignore")
    if len(re.findall(r"^\d\d:\d\d:\d\d[,.]\d+ --> ", text, flags=re.M)) < 50:
        raise SystemExit("Download did not return a full SRT file (server error?); try again later")
    return best["SubFileName"], text


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: new-explainer.py <movie-slug> <imdb-id, e.g. tt0816711>")
    slug = re.sub(r"[^a-z0-9-]+", "-", sys.argv[1].lower()).strip("-")
    imdb_id = sys.argv[2].replace("tt", "").strip()
    folder = os.path.join(NOTES, slug)
    if os.path.exists(folder):
        raise SystemExit(f"{folder} already exists")
    name, srt = find_sdh(imdb_id)
    os.makedirs(folder)
    with open(os.path.join(folder, "sdh.srt"), "w", encoding="utf-8") as f:
        f.write(srt)
    with open(os.path.join(folder, "script.md"), "w", encoding="utf-8") as f:
        f.write(f"# {slug}: script fact check\n\nSDH source: `{name}`\n\n"
                "| # | Sentence | Facts and SDH timecode | Status |\n|---|---|---|---|\n")
    with open(os.path.join(folder, "clips.md"), "w", encoding="utf-8") as f:
        f.write(f"# {slug}: clip verification\n\n"
                "| Clip | Start (s) | Cue or line | Source | Status | Sentences |\n|---|---|---|---|---|---|\n")

    print(f"Created {folder}")
    print(f"SDH track: {name} ({srt.count('-->')} entries)")
    print("Next: write the story script, fill script.md, pick clips from sdh.srt into clips.md, then update the sheet.")


if __name__ == "__main__":
    main()
