import json
import sys
import wave

import numpy as np
from kokoro import KPipeline

SAMPLE_RATE = 24000


def main() -> None:
    text_file, out_wav = sys.argv[1], sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "am_liam"
    speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0

    with open(text_file, encoding="utf-8") as f:
        text = f.read().strip()
    if not text:
        raise SystemExit("empty script text")

    pipeline = KPipeline(lang_code="a")
    chunks = []
    for _, _, audio in pipeline(text, voice=voice, speed=speed):
        arr = (
            audio.detach().cpu().numpy()
            if hasattr(audio, "detach")
            else np.asarray(audio)
        )
        chunks.append(np.asarray(arr, dtype=np.float32).flatten())

    if not chunks:
        raise SystemExit("kokoro produced no audio")

    frames = np.concatenate(chunks)
    pcm = (np.clip(frames, -1.0, 1.0) * 32767).astype(np.int16)
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(pcm.tobytes())

    print(
        json.dumps({"path": out_wav, "duration": round(len(frames) / SAMPLE_RATE, 3)})
    )


if __name__ == "__main__":
    main()
