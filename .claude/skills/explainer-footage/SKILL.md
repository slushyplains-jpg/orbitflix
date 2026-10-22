---
name: explainer-footage
description: Stage 5 of the explainer pipeline. Turn the approved script into a 14-clip plan with every clip chosen from checked frames. Use when building or fixing a clip plan, choosing clip start times, or when clips look dark, blurry, or unrelated to the narration.
---

# Footage: the clip plan

Subtitles say when a line is spoken, not what is on screen. Every clip start is chosen by looking at frames, and every frame is screened for darkness and softness by a script first.

## Steps

The session that wrote the story does this stage itself (no helper): picking a picture that matches a sentence needs judgment, and it is only two images.

1. **Run the footage tool** (run it, do not read its source; the dev server must be running): `python3.11 scripts/explainer-footage-auto.py <slug> <tmdb>`. In about 4 to 5 minutes it fetches the stream link, measures how far the stream drifts from the subtitles (`sync.json`, about a minute, first run only), builds `beats.json` from the Picture times in `script.md` converted to stream time (pairing sentences that share a picture), builds the grids, ranks three candidates per beat near each Picture time, draws `candidates_1.jpg` and `candidates_2.jpg`, and writes a default `picks.txt`.
2. **Look at both candidate sheets.** For every beat ask: would a viewer hearing this sentence nod at this picture? A clip must show the subject of the sentence (the person, the creature, the door, the walk), not people talking about it, not a map, not a different person.
3. **Edit `picks.txt`:** keep `a` only if it passes that test, else `b` or `c`. If none passes, open that beat's grid `shots/<name>.jpg` and write a time that shows it (never a red DARK frame). If the grid has nothing either, the Picture time in `script.md` is wrong: fix it, delete `beats.json`, and rerun the tool. For B01, the hook, take the most striking frame that fits.
4. **Gate:** `python3.11 scripts/explainer-clips.py <slug>` must print RESULT PASS. It writes `clips.json` with subtitle quotes and regenerates `clips.md`.

`explainer-clips.py` records the footage stage when it passes.

## SigLIP

Optional, only as a shortlist inside a window. Its scores are not evidence; a 0.99 score has matched a wrong frame before. Every candidate still gets checked on the grid.
