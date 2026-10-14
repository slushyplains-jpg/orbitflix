import json
import os
import subprocess
import sys
import tempfile

import torch
from PIL import Image
from transformers import AutoModel, AutoProcessor

MODEL_NAME = "google/siglip-base-patch16-224"


def extract_frames(video: str, fps: int = 1):
    out_dir = tempfile.mkdtemp(prefix="siglip_frames_")
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-i",
            video,
            "-vf",
            f"fps={fps},scale=448:-2",
            "-q:v",
            "2",
            os.path.join(out_dir, "f_%04d.jpg"),
        ],
        check=True,
    )
    files = sorted(f for f in os.listdir(out_dir) if f.endswith(".jpg"))
    return [os.path.join(out_dir, f) for f in files], out_dir


def main() -> None:
    entries = json.load(open(sys.argv[1], encoding="utf-8"))
    print("loading siglip model...", file=sys.stderr, flush=True)
    processor = AutoProcessor.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME)
    model.eval()
    print("model ready", file=sys.stderr, flush=True)

    for e in entries:
        result = {
            "id": e.get("id"),
            "best_sec": None,
            "shift": 0,
            "score": 0.0,
            "flat": True,
        }
        try:
            frames, tmp = extract_frames(e["window"])
            if frames:
                images = [Image.open(p).convert("RGB") for p in frames]
                inputs = processor(
                    text=[e["prompt"]],
                    images=images,
                    padding="max_length",
                    return_tensors="pt",
                )
                with torch.no_grad():
                    probs = torch.sigmoid(model(**inputs).logits_per_image).squeeze(-1)
                scores = [float(x) for x in probs.tolist()]
                best = max(range(len(scores)), key=lambda i: scores[i])
                spread = max(scores) - min(scores)
                result = {
                    "id": e.get("id"),
                    "best_sec": round(e["offset"] + best, 2),
                    "shift": best,
                    "score": round(scores[best], 3),
                    "flat": spread < 0.08,
                }
                subprocess.run(["rm", "-rf", tmp])
        except Exception as ex:  # noqa: BLE001
            result["error"] = str(ex)
        print(json.dumps(result), flush=True)


if __name__ == "__main__":
    main()
