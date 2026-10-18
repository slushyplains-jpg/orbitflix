"""Lint an explainer script (and optionally its clip plan) before it goes to the sheet.

Usage: python3.11 explainer-lint.py <script.txt> [clips.json]
Exit code 1 if any FAIL. WARN lines are style problems to fix unless there is a reason not to.
The sentence split matches the aligner and the render: re.split(r"(?<=[.!?])\\s+").
"""
import json
import re
import statistics
import sys

SPLIT = re.compile(r"(?<=[.!?])\s+")
WORDS_MIN, WORDS_MAX = 215, 240
CLIPS_REQUIRED = 14
GENERIC_ENDINGS = [
    "what is out there", "will anyone get out", "will they make it", "what happens next",
    "will any of them", "will anyone survive", "will they survive", "what will they find",
    "will anyone be found",
]
FILLER = ["changes everything", "nothing will ever be the same", "little do they know", "in a world where"]
REPORTING = re.compile(r"\b(says|said|asks|asked|tells|told|replies|insists)\b", re.I)


def lint_script(text):
    fails, warns = [], []
    text = text.strip()
    sents = SPLIT.split(text)
    words = text.split()
    n = len(words)
    if not WORDS_MIN <= n <= WORDS_MAX:
        fails.append(f"word count {n}, needs {WORDS_MIN}-{WORDS_MAX} (about 60 s at 1.0x)")
    if re.search(r"[:;]", text):
        fails.append("contains a colon or semicolon")
    if re.search(r"[\"“”]", text):
        fails.append("contains double quotes (they break the sentence split); write the line as narration")
    abbr = re.findall(r"\b(?:Mr|Mrs|Ms|Dr|St|Jr|Sr|vs|etc|No)\.|\b(?:[A-Z]\.){2,}", text)
    if abbr:
        fails.append(f"abbreviations with periods split sentences wrongly: {sorted(set(abbr))}")
    if len(sents) < CLIPS_REQUIRED:
        fails.append(f"{len(sents)} sentences, needs at least {CLIPS_REQUIRED} so each of the {CLIPS_REQUIRED} cuts has a sentence")
    if len(sents) > CLIPS_REQUIRED * 2:
        fails.append(f"{len(sents)} sentences, too many for {CLIPS_REQUIRED} cuts of at most two sentences each")
    rep = REPORTING.findall(text)
    if len(rep) > 2:
        fails.append(f"{len(rep)} reporting verbs (says/asks/tells...), max 2. Show what happens instead of who said what")
    first = sents[0].split()
    if len(first) > 22:
        warns.append(f"hook is {len(first)} words; the first sentence should be a short, concrete image")
    last = sents[-1].lower()
    if any(g in last for g in GENERIC_ENDINGS):
        fails.append("ending is a generic template question; end on a cliffhanger specific to this film")
    for f in FILLER:
        if f in text.lower():
            warns.append(f"filler phrase: '{f}'")
    openers = {}
    for s in sents:
        w = re.sub(r"[^\w']", "", s.split()[0]).lower() if s.split() else ""
        openers[w] = openers.get(w, 0) + 1
    for w, c in openers.items():
        if c >= 3:
            warns.append(f"{c} sentences start with '{w}'")
    pattern = sum(1 for s in sents if re.match(r"^[^,]{3,}, and ", s))
    if pattern > len(sents) // 2:
        warns.append(f"{pattern} of {len(sents)} sentences use the 'X, and Y' shape; vary the rhythm")
    lens = [len(s.split()) for s in sents]
    if len(lens) > 2 and statistics.pstdev(lens) < 3:
        warns.append("sentence lengths are too uniform; mix short punches with longer lines")
    names = set()
    for s in sents:
        for w in s.split()[1:]:
            w2 = re.sub(r"[^\w-]", "", w)
            if w2[:1].isupper() and w2.lower() not in {"i"}:
                names.add(w2)
    if len(names) > 6:
        warns.append(f"{len(names)} capitalised names/places ({sorted(names)}); use roles for minor characters")
    return sents, n, fails, warns


def lint_plan(clips, n_sents):
    fails = []
    if len(clips) != CLIPS_REQUIRED:
        fails.append(f"{len(clips)} clips, needs exactly {CLIPS_REQUIRED}")
    covered = []
    for k, c in enumerate(clips, 1):
        if not isinstance(c.get("start"), (int, float)) or c["start"] < 0:
            fails.append(f"clip {k}: bad start {c.get('start')}")
        a, b = (c.get("sentences") or [None, None])[:2]
        if a is None or b is None or b < a:
            fails.append(f"clip {k}: bad sentence range {c.get('sentences')}")
            continue
        if b - a > 1:
            fails.append(f"clip {k}: covers {b - a + 1} sentences, max 2")
        covered.extend(range(a, b + 1))
        if "UNVERIFIED" in str(c.get("action", "")):
            fails.append(f"clip {k}: still UNVERIFIED, no checked shot")
        if not str(c.get("action", "")).strip():
            fails.append(f"clip {k}: empty action (what the frame shows)")
    if covered != list(range(n_sents)):
        fails.append(f"sentence ranges must cover 0..{n_sents - 1} once, in order; got {covered}")
    return fails


def main():
    text = open(sys.argv[1], encoding="utf-8").read()
    sents, n, fails, warns = lint_script(text)
    if len(sys.argv) > 2:
        fails += lint_plan(json.load(open(sys.argv[2], encoding="utf-8")), len(sents))
    print(f"{len(sents)} sentences, {n} words")
    for f in fails:
        print("FAIL", f)
    for w in warns:
        print("WARN", w)
    print("RESULT", "FAIL" if fails else ("PASS with warnings" if warns else "PASS"))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
