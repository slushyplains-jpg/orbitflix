import difflib
import json
import re
import sys

from faster_whisper import WhisperModel


def norm(token):
    return re.sub(r"[^a-z0-9]", "", token.lower())


def split_sentences(text):
    return [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s]


def main():
    wav, text_file, out_file = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(text_file, encoding="utf-8") as f:
        sentences = split_sentences(f.read())

    model = WhisperModel("base.en", device="cpu", compute_type="int8")
    # With word timestamps on, Whisper can stop early and drop the last sentence.
    # Turning off conditioning on previous text keeps the full transcript.
    segments, _ = model.transcribe(
        wav, language="en", word_timestamps=True, condition_on_previous_text=False
    )
    heard = [
        {"tok": norm(w.word), "start": w.start, "end": w.end}
        for seg in segments
        for w in seg.words
        if norm(w.word)
    ]

    tokens = []
    for i, s in enumerate(sentences):
        for t in s.split():
            if norm(t):
                tokens.append({"text": t, "norm": norm(t), "sent": i})

    matcher = difflib.SequenceMatcher(None, [t["norm"] for t in tokens], [h["tok"] for h in heard], autojunk=False)
    mapping = {}
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal" or (tag == "replace" and (i2 - i1) == (j2 - j1)):
            for k in range(i2 - i1):
                mapping[i1 + k] = j1 + k

    windows = []
    for i, s in enumerate(sentences):
        hits = [mapping[k] for k in range(len(tokens)) if tokens[k]["sent"] == i and k in mapping]
        if not hits:
            raise SystemExit(json.dumps({"error": f"sentence not found in voiceover: {s[:60]}"}))
        windows.append({
            "text": s,
            "start": heard[min(hits)]["start"],
            "end": heard[max(hits)]["end"],
        })

    words = []
    for k, t in enumerate(tokens):
        if k in mapping:
            h = heard[mapping[k]]
            words.append({"sent": t["sent"], "text": t["text"], "start": h["start"], "end": h["end"]})
        else:
            words.append({"sent": t["sent"], "text": t["text"], "start": None, "end": None})

    for k, w in enumerate(words):
        if w["start"] is not None:
            continue
        s_win = windows[w["sent"]]
        prev_end = next((words[j]["end"] for j in range(k - 1, -1, -1) if words[j]["sent"] == w["sent"] and words[j]["end"] is not None), s_win["start"])
        next_start = next((words[j]["start"] for j in range(k + 1, len(words)) if words[j]["sent"] == w["sent"] and words[j]["start"] is not None), s_win["end"])
        w["start"], w["end"] = prev_end, max(prev_end, next_start)

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"sentences": windows, "words": words}, f)
    print(json.dumps({"sentences": len(windows), "words": len(words)}))


if __name__ == "__main__":
    main()
