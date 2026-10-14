import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920


def render(words, active, style, out_path, fonts, scale):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if words:
        base, big = fonts(round(style["size"] * scale)), fonts(round(style["size"] * 1.12 * scale))
        space = base.getlength(" ")
        widths = [(big if i == active else base).getlength(w) for i, w in enumerate(words)]
        x = (W - (sum(widths) + space * (len(words) - 1))) / 2
        y_center = int(H * style["y"] / 100)
        draw = ImageDraw.Draw(img)
        for i, word in enumerate(words):
            if i == active:
                draw.text((x, y_center), word, font=big, fill=style["highlightColor"], stroke_width=round(style["stroke"] * scale), stroke_fill=style["strokeColor"], anchor="lm")
            else:
                draw.text((x, y_center), word, font=base, fill=style["textColor"], stroke_width=round(style["stroke"] * scale), stroke_fill=style["strokeColor"], anchor="lm")
            x += widths[i] + space
    img.save(out_path)


def main():
    states_file, out_dir = sys.argv[1], sys.argv[2]
    with open(states_file, encoding="utf-8") as f:
        data = json.load(f)
    style = data["style"]
    states = data["states"]
    cache = {}

    def fonts(px):
        if px not in cache:
            cache[px] = ImageFont.truetype(style["fontFile"], px)
        return cache[px]

    os.makedirs(out_dir, exist_ok=True)
    lines = []
    for i, st in enumerate(states):
        duration = st["end"] - st["start"]
        if duration <= 0.01:
            continue
        path = os.path.join(out_dir, f"cap_{i:04d}.png")
        render(st["words"], st["active"], style, path, fonts, st.get("scale", 1.0))
        lines.append(f"file '{path}'")
        lines.append(f"duration {duration:.3f}")
    if lines:
        lines.append(f"file '{path}'")
    with open(os.path.join(out_dir, "caps.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(json.dumps({"frames": len(lines) // 2}))


if __name__ == "__main__":
    main()
