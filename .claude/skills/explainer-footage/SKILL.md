---
name: explainer-footage
description: Stage 5 of the explainer pipeline. Turn the approved script into a 14-clip plan with every clip chosen from checked frames. Use when building or fixing a clip plan, choosing clip start times, or when clips look dark, blurry, or unrelated to the narration.
---

# Footage: the clip plan

Subtitles say when a line is spoken, not what is on screen. Every clip start is chosen by looking at frames, and every frame is screened for darkness and softness by a script first.

## Steps

1. **Run the footage tool** (run it, do not read its source; the dev server must be running): `python3.11 scripts/explainer-footage-auto.py <slug> <tmdb>`. In about 3 minutes it builds `beats.json` from the script and the times cited in `script.md`, fetches the stream link, builds the grids, ranks three candidates per beat near each beat's moment, draws `candidates_1.jpg` and `candidates_2.jpg`, and writes a default `picks.txt` that picks candidate a for every beat.
2. **Look at the two candidate sheets** (two Read calls). For each beat, check that candidate a shows what the sentence is about. Prefer action and faces reacting; never use the same shot twice.
3. **Edit `picks.txt` only where a is wrong:** change the letter to b or c. If none of the three fits, open that beat's full grid `shots/<name>.jpg` once and write a time instead (never a red DARK frame). Do not extract extra frames or rerun the tool.
4. **Gate:** `python3.11 scripts/explainer-clips.py <slug>` must print RESULT PASS. It writes `clips.json` with subtitle quotes and regenerates `clips.md`.

A normal run is about 5 tool calls: the tool, two image reads, one picks edit, the gate.

`explainer-clips.py` records the footage stage when it passes.

## SigLIP

Optional, only as a shortlist inside a window. Its scores are not evidence; a 0.99 score has matched a wrong frame before. Every candidate still gets checked on the grid.
