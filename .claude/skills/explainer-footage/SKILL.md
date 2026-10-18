---
name: explainer-footage
description: Stage 5 of the explainer pipeline. Turn the approved script into a 14-clip plan with every clip chosen from checked frames. Use when building or fixing a clip plan, choosing clip start times, or when clips look dark, blurry, or unrelated to the narration.
---

# Footage: the clip plan

Subtitles say when a line is spoken, not what is on screen. Every clip start is chosen by looking at frames, and every frame is screened for darkness and softness by a script first.

## Steps

1. **Group the script into 14 beats.** Each beat is one or two sentences, in order, covering every sentence once.
2. **Write the picture each beat needs** in plain visible terms ("a man running through a smoky corridor"), using the story bible's best images.
3. **Pick a search window per beat.** Start from the subtitle time of the moment, or the plot-summary position. Use 30 to 60 seconds. Put them in a windows file: `[{"name": "B03_bridge", "start": 1700, "end": 1740}]`.
4. **Get a stream link** with `python3.11 scripts/explainer-get-m3u8.py /movie/<tmdb> <link.txt>` (start the dev server with preview tools first; the script finds its port). One link per session is enough; it lasts about four hours.
5. **Build shot grids:** `python3.11 scripts/explainer-shots.py <link.txt> <windows.json> notes/explainer/<slug>/shots`. Each frame is labeled with its film time. Red DARK means near-black and unusable. Yellow DIM or SOFT means usable but check it (dark scenes and close-ups with soft backgrounds land here). "|" marks a shot change; it can miss cuts in very dark scenes, so treat it as a hint.
6. **Look at every grid and choose the start.** Rules:
   - Never choose a red DARK frame. Prefer white-labeled frames over yellow DIM or SOFT ones when the picture is equally right.
   - Prefer a start at or just after a shot change, so the clip opens on a clean shot.
   - Prefer action and faces reacting over people standing and talking.
   - Do not reuse the same shot for two beats.
   - If no frame fits, widen or move the window and build a new grid. If nothing fits after two tries, rewrite that sentence to match footage that exists.
7. **Write `clips.json`**: `start`, `sentences`, `quote` (the subtitle line at that start, verbatim, or ""), `action` (what the chosen frame shows), `visual_prompt`, `needs_visual_scan: false`.
8. **Gate:** `python3.11 scripts/explainer-lint.py script.txt clips.json` must print RESULT PASS. Then regenerate the log with `python3.11 scripts/explainer-notes.py <slug>`.

Record with `explainer-status.py <slug> footage`.

## SigLIP

Optional, only as a shortlist inside a window. Its scores are not evidence; a 0.99 score has matched a wrong frame before. Every candidate still gets checked on the grid.
