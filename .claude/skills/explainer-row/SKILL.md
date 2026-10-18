---
name: explainer-row
description: Retired stage. The pipeline no longer writes the sheet; use this only if the user asks to write a movie's row by hand, and as the reference for the sheet's data format. Use when writing or editing a row in the explainer sheet (script in column D, clip plan JSON in column E, status in column G), or when checking what a clip field means. For making a Short end to end, start with explainer-pipeline.
---

# Explainer rows (sheet format)

The full process lives in `explainer-pipeline`. This skill covers only how a finished movie is written into the sheet, and what each field means.

Sheet: spreadsheet `1GQ5VKjlPbYsrovwvlo7txLBmbtz387Zwb4it6T4D__s`, `Sheet1`. Rows are in movie order: row 2 is World War Z, row 3 The Host, and so on. Read column B to find a movie's row before writing; never assume.

## Before writing a row

Stages 1 to 5 must have passed (`python3.11 scripts/explainer-status.py <slug>`). The row is written from the files, never retyped:

- Column D = `notes/explainer/<slug>/script.txt`, exactly.
- Column E = `clips.json` as compact JSON.
- Column F = empty. Durations never go in the sheet; the render sets clip lengths from the voice.
- Column G = `READY_FOR_LOCAL_RENDER` (only after stages 1 to 5 pass), otherwise `To-do`.

Build the values with `python3.11 scripts/explainer-row-values.py <slug> ready` and pass its output unchanged as `values` for range `Sheet1!D<row>:G<row>`. Never retype or hand-escape the JSON. Write columns D to G of that one row in a single update. Do not touch other rows or columns. There is no sheet stage in the tracker any more.

## Clip fields

- `start`: film time in seconds where the clip begins, chosen from a checked frame grid (see `explainer-footage`). It must trace back to a subtitle line or a plot-summary moment, never a guess.
- `sentences`: `[first, last]`, a 0-based inclusive range into the script split by `(?<=[.!?])\s+`. Every sentence belongs to exactly one clip, in order. A clip covers one or two sentences. There are exactly 14 clips.
- `quote`: the subtitle line at that start, verbatim, or `""`.
- `action`: what the chosen frame shows. A clip without a checked shot is marked `UNVERIFIED:` and blocks the row.
- `visual_prompt`: what is visible on screen, in plain words. `needs_visual_scan`: `false` unless a SigLIP search is wanted.

## Targets

14 cuts, about 230 to 240 words, 55 to 63 seconds of voice at the `final` template's speed (1.0x). The linter and voice check in `scripts/` enforce these.

## When you don't know

Say so. Never fill a gap with a plausible-looking timestamp or a fact the film does not support.
