---
name: explainer-footage
description: Stage 5 of the explainer pipeline. Turn the approved script into a 14-clip plan with every clip chosen from checked frames. Use when building or fixing a clip plan, choosing clip start times, or when clips look dark, blurry, or unrelated to the narration.
---

# Footage: the clip plan

Subtitles say when a line is spoken, not what is on screen. Every clip start is chosen by looking at frames, and every frame is screened for darkness and softness by a script first.

## Steps

1. **Group the script into 14 beats.** Each beat is one or two sentences, in order, covering every sentence once.
2. **Pick a search window per beat**, 30 to 40 seconds, from the subtitle time of the moment (`sdh_digest.txt`) or the plot-summary position. Write `notes/explainer/<slug>/beats.json`:
   `[{"name": "B01_head", "sentences": [0, 0], "at": 1281, "start": 1265, "end": 1300}, ...]`
   `at` is the time of the exact moment (the subtitle line or sound cue), and the window should start 10 to 15 s before it. Candidates are ranked by closeness to `at`, so a correct `at` is what makes the candidates match.
3. **Run the footage tool** (run it, do not read its source) (dev server must be running; the tool finds it): `python3.11 scripts/explainer-footage-auto.py <slug> <tmdb>`. In about 2 to 3 minutes it fetches the stream link, builds every grid in parallel, ranks three candidate starts per beat, and draws `candidates_1.jpg` and `candidates_2.jpg` (each beat's sentence with candidates a, b, c).
4. **Look at the two candidate sheets.** For each beat pick the candidate whose picture matches the sentence. Rules: prefer action and faces reacting over people standing and talking; never reuse the same shot for two beats. Only if none of a beat's three matches, open that beat's full grid `shots/<name>.jpg` and pick a frame time yourself (never a red DARK one). Do not extract extra frames or rerun the tool for a single beat.
5. **Write `picks.txt`**, one line per beat in order: `B01_head b | what the frame shows`, or `B01_head 1273 | what the frame shows` for a time from the full grid.
6. **Gate:** `python3.11 scripts/explainer-clips.py <slug>` writes `clips.json` (subtitle quotes filled in automatically), runs the plan check, and regenerates `clips.md`. It must print RESULT PASS.

Record with `explainer-status.py <slug> footage`.

## SigLIP

Optional, only as a shortlist inside a window. Its scores are not evidence; a 0.99 score has matched a wrong frame before. Every candidate still gets checked on the grid.
