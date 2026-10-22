"""Map subtitle time to stream time for one movie, so Picture times land on the right frames.

Usage: python3.11 explainer_sync.py <slug> <link-file>
Subtitle files often come from a different release than the stream (another frame rate, an extra
intro or recap), so subtitle times can be off by seconds to minutes, and not always by the same
amount. This grabs short bits of the stream's audio at several points through the film, transcribes
them locally with faster-whisper, finds the matching subtitle lines, and writes
notes/explainer/<slug>/sync.json with one (subtitle time, stream time) point per probe.

Other tools import to_stream() and to_sdh(), which interpolate between those points.
No model usage: it all runs on this machine in about a minute.
"""
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = "User-Agent: Mozilla/5.0\r\nReferer: https://stellarconductornexus.com/\r\n"
PROBES = [0.10, 0.24, 0.38, 0.52, 0.66, 0.80, 0.92]
CLIP_SEC = 45


def _norm(text):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9' ]", " ", text.lower())).strip()


def _cues(slug):
    srt = open(os.path.join(ROOT, "notes/explainer", slug, "sdh.srt"), encoding="utf-8", errors="ignore").read()
    out = []
    for block in re.split(r"\n\s*\n", srt.strip()):
        lines = block.splitlines()
        for i, line in enumerate(lines):
            m = re.match(r"(\d+):(\d+):(\d+),(\d+) --> ", line)
            if m:
                g = list(map(int, m.groups()))
                text = re.sub(r"<[^>]+>|\([^)]*\)|\[[^\]]*\]|[A-Z ]+:|#+|♪", " ", " ".join(lines[i + 1:]))
                if len(_norm(text).split()) >= 3:  # spoken lines only; sound cues cannot be heard as words
                    out.append((g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000, _norm(text)))
                break
    return out


def _points(slug):
    p = os.path.join(ROOT, "notes/explainer", slug, "sync.json")
    return json.load(open(p))["points"] if os.path.exists(p) else []


def _interp(t, pts):
    if not pts:
        return t
    if len(pts) == 1:
        return t + (pts[0][1] - pts[0][0])
    pts = sorted(pts)
    if t <= pts[0][0]:
        a, b = pts[0], pts[1]
    elif t >= pts[-1][0]:
        a, b = pts[-2], pts[-1]
    else:
        a, b = next((p, q) for p, q in zip(pts, pts[1:]) if p[0] <= t <= q[0])
    if b[0] == a[0]:
        return t + (a[1] - a[0])
    return a[1] + (t - a[0]) * (b[1] - a[1]) / (b[0] - a[0])


def to_stream(slug, sdh_t):
    """Subtitle time (seconds) to stream time, using sync.json if it exists."""
    return _interp(sdh_t, _points(slug))


def to_sdh(slug, stream_t):
    """Stream time (seconds) back to subtitle time."""
    return _interp(stream_t, [[b, a] for a, b in _points(slug)])


def main():
    slug, link_file = sys.argv[1], sys.argv[2]
    link = open(link_file).read().strip()
    cues = _cues(slug)
    if not cues:
        sys.exit("no spoken subtitle lines found")
    from faster_whisper import WhisperModel
    model = WhisperModel("base.en", device="cpu", compute_type="int8")
    film_end = cues[-1][0]
    tmp = tempfile.mkdtemp(prefix=f"sync_{slug}_")
    points = []
    for frac in PROBES:
        at = frac * film_end
        wav = os.path.join(tmp, f"p{int(at)}.wav")
        try:
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-rw_timeout", "15000000", "-headers", H, "-ss", str(at),
                            "-i", link, "-t", str(CLIP_SEC), "-vn", "-ac", "1", "-ar", "16000", wav],
                           capture_output=True, timeout=120)
        except subprocess.TimeoutExpired:
            continue
        if not os.path.exists(wav):
            continue
        segments, _ = model.transcribe(wav, language="en", condition_on_previous_text=False)
        offsets = []
        for seg in segments:
            heard = _norm(seg.text)
            if len(heard.split()) < 4:
                continue
            words = set(heard.split())
            best = (0.0, None)
            for start, text in cues:
                # cheap word-overlap filter before the slower sequence match
                if len(words & set(text.split())) < max(2, len(words) // 3):
                    continue
                r = difflib.SequenceMatcher(None, heard, text).ratio()
                if r > best[0]:
                    best = (r, start)
            if best[0] >= 0.72:
                offsets.append(at + seg.start - best[1])
        if len(offsets) >= 2:
            offsets.sort()
            off = offsets[len(offsets) // 2]  # median: one bad match cannot move it
            close = [o for o in offsets if abs(o - off) < 3]
            if len(close) >= 2:
                stream_t = at + 20
                points.append([round(stream_t - off, 2), round(stream_t, 2)])
                print(f"probe at {int(at // 60)}:{int(at % 60):02d}: subtitles are {off:+.1f}s off ({len(close)} lines agree)")
                continue
        print(f"probe at {int(at // 60)}:{int(at % 60):02d}: no reliable match (music, silence, or no dialogue)")
    # keep points that go forward in both clocks; a backwards point is a wrong match
    points.sort()
    clean = []
    for p in points:
        if not clean or (p[0] > clean[-1][0] and p[1] > clean[-1][1]):
            clean.append(p)
    out = os.path.join(ROOT, "notes/explainer", slug, "sync.json")
    json.dump({"points": clean}, open(out, "w"), indent=1)
    if not clean:
        print("no sync points; Picture times will be used as they are")
    else:
        offs = [b - a for a, b in clean]
        print(f"wrote sync.json with {len(clean)} points; offset ranges from {min(offs):+.1f}s to {max(offs):+.1f}s")


if __name__ == "__main__":
    main()
