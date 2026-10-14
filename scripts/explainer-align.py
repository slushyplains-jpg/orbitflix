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
    segments, _ = model.transcribe(wav, language="en", word_timestamps=True)
    heard = [
        {"tok": norm(w.word), "start": w.start, "end": w.end}
        for seg in segments
        for w in seg.words
        if norm(w.word)
    ]

    script_tokens, owner = [], []
    for i, s in enumerate(sentences):
        for t in s.split():
            if norm(t):
                script_tokens.append(norm(t))
                owner.append(i)

    matcher = difflib.SequenceMatcher(None, script_tokens, [h["tok"] for h in heard], autojunk=False)
    mapping = {}
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal" or (tag == "replace" and (i2 - i1) == (j2 - j1)):
            for k in range(i2 - i1):
                mapping[i1 + k] = j1 + k

    windows = []
    for i, s in enumerate(sentences):
        hits = [mapping[k] for k in range(len(script_tokens)) if owner[k] == i and k in mapping]
        if not hits:
            raise SystemExit(json.dumps({"error": f"sentence not found in voiceover: {s[:60]}"}))
        windows.append({
            "text": s,
            "start": heard[min(hits)]["start"],
            "end": heard[max(hits)]["end"],
        })

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(windows, f)
    print(json.dumps({"sentences": len(windows)}))


if __name__ == "__main__":
    main()
