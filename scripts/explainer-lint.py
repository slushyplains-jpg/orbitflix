"""Lint an explainer script (and optionally its clip plan) before it goes to the sheet.

Usage: python3.11 explainer-lint.py <script.txt> [clips.json]
Exit code 1 if any FAIL. WARN lines are style problems to fix unless there is a reason not to.
The sentence split matches the aligner and the render: re.split(r"(?<=[.!?])\\s+").
"""
import json
import os
import re
import statistics
import sys

SPLIT = re.compile(r"(?<=[.!?])\s+")
# Kokoro am_liam at 1.0x speaks about 4.1 words/s, so 55-63 s is roughly 228-255 words.
WORDS_MIN, WORDS_MAX = 210, 265
CLIPS_REQUIRED = 14
GENERIC_ENDINGS = [
    "what is out there", "will anyone get out", "will they make it", "what happens next",
    "will any of them", "will anyone survive", "will they survive", "what will they find",
    "will anyone be found",
]
FILLER = ["changes everything", "nothing will ever be the same", "little do they know", "in a world where"]
HARD_WORDS = ["reactor", "drilling", "quarantine", "protocol", "specimen", "organism", "submersible", "bulkhead",
              "decompression", "implode", "implodes", "imploded", "containment", "radiation", "coolant", "thruster",
              "thrusters", "atmosphere", "evacuation", "pressure suit", "pressure suits", "hypothermia", "firewall",
              "hibernate", "hibernating", "trajectory", "orbit", "parasite", "pathogen", "facility", "personnel",
              "catastrophic", "integrity", "compromised", "transmission", "frequency", "subsequently", "approximately",
              "meltdown", "biologist", "exobiologist", "rebreather", "nitrogen", "oxygen scrubber"]
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
    chain = sum(1 for s in sents if re.match(r"^(then|so|now|and|when|after|later)\b", s.strip().lower()))
    if chain > len(sents) * 0.4:
        warns.append(f"{chain} of {len(sents)} sentences start with then/so/now/when; this reads as a recap, build around the protagonist's choice instead")
    vague = len(re.findall(r"\b(one of them|someone|an? (?:engineer|commander|officer|soldier|doctor|scientist)|the (?:engineer|commander|officer|soldier|doctor|scientist))\b", text.lower()))
    if vague > 2:
        warns.append(f"{vague} role-only phrases ('one of them', 'the engineer'); name people who carry feeling, introduced once with their role")
    pattern = sum(1 for s in sents if re.match(r"^[^,]{3,}, and ", s))
    if pattern > len(sents) // 2:
        warns.append(f"{pattern} of {len(sents)} sentences use the 'X, and Y' shape; vary the rhythm")
    lens = [len(s.split()) for s in sents]
    if len(lens) > 2 and statistics.pstdev(lens) < 3:
        warns.append("sentence lengths are too uniform; mix short punches with longer lines")
    # Plain words: the listener is half watching on a phone. Grade is the Flesch-Kincaid reading
    # level from sentence length and syllables; hard words are jargon a stranger would not know.
    words_l = re.findall(r"[a-z']+", text.lower())
    syl = lambda w: max(1, len(re.findall(r"[aeiouy]+", w)) - (1 if w.endswith("e") and not w.endswith(("le", "ee")) and len(re.findall(r"[aeiouy]+", w)) > 1 else 0))
    grade = 0.39 * len(words_l) / max(1, len(sents)) + 11.8 * sum(syl(w) for w in words_l) / max(1, len(words_l)) - 15.59
    if grade > 7:
        fails.append(f"reading level {grade:.1f} is too hard (max 7, aim under 5); use shorter sentences and everyday words")
    elif grade > 5:
        warns.append(f"reading level {grade:.1f}; aim under 5 with shorter sentences and everyday words")
    hard = sorted({w for w in HARD_WORDS if re.search(rf"\b{w}\b", text.lower())})
    if len(hard) >= 4:
        fails.append(f"{len(hard)} hard words a stranger may not know: {hard}; say them in everyday words")
    elif hard:
        warns.append(f"hard words: {hard}; say them in everyday words if you can")
    if len(re.findall(r"\bsomething\b", text.lower())) > 1:
        warns.append("'something' used more than once; say what the danger is")
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
    # Fitted on past Kokoro am_liam renders at 1.0x (about +-1 s). Aim for 58-60 s here,
    # then confirm once with explainer-voicecheck.py instead of running the voice repeatedly.
    est = 0.0536 * len(text) - 0.42 * len(sents)
    print(f"{len(sents)} sentences, {n} words, estimated voice {est:.1f}s (aim 58-61, good to about 2 s; the voice check decides)")
    for f in fails:
        print("FAIL", f)
    for w in warns:
        print("WARN", w)
    print("RESULT", "FAIL" if fails else ("PASS with warnings" if warns else "PASS"))
    if not fails and len(sys.argv) == 2:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from explainer_record import record, slug_of
        record(slug_of(sys.argv[1]), "lint", f"{len(sents)} sentences, {n} words, est {est:.1f}s")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
