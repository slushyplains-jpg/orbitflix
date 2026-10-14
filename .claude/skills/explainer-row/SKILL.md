---
name: explainer-row
description: Create or edit production rows for the explainer sheet (script in column D, clip plan JSON in column E, status in column G). Use when adding a new movie row, revising a clip plan, or when asked to write clip timestamps, quotes, or sentence ranges.
---

# Explainer rows

A row feeds `/admin/explainer`. The render generates its own voiceover and times clips from it, so the sheet only defines what plays and which sentences it covers.

## Hard rules (never break these)

1. **Never invent clip `start` times.** A start time must come from an SDH subtitle timecode or cue. If no source is available, leave the clip out and tell the user which beat is missing footage. The first plan was guessed this way and is the main reason footage mismatches.
2. **`quote` must be verbatim** from the subtitle line at that `start`, or `""` if the moment has no dialogue. Do not paraphrase or write dialogue from memory.
3. **`action` describes only what is visible at that `start`.** If you have not verified the frame, write `"UNVERIFIED: <guess>"` so it is obvious. Action text must match the SDH cue or line it's based on.
4. **Do not write `duration` or the total in the sheet.** The render measures the voice and sizes clips. Column F is left empty.
5. **Script (column D) must be the exact text that will be voiced.** Use periods and commas only. No colons, and no semicolons. Keep the sentences in order.
6. **`sentences` is a 0-based inclusive range** into the script split by `(?<=[.!?])\s+`. Every sentence must belong to exactly one clip group, in order, with no gaps and no overlaps. Clips that share a range split that range evenly.
7. **Clip `start` values must increase** within the plan so the parser's chronological check passes.
8. **Status** is `To-do` for a new row that still needs review, or `READY_FOR_LOCAL_RENDER` only after every clip's `start` comes from an SDH cue or line.
9. **Do not change other rows** or other columns when editing one row.

## Target length: 60 seconds

- **Script:** about 200–210 words, about 60 seconds of voice at 0.9x (the render speed we use). Count the words before saving to the sheet.
- **Clips:** 16–17 cuts, averaging about 3.6 seconds each. Each sentence group needs at least one clip.
- **Cue check:** before writing the story, count the SDH action cues and sourced lines in the film. If there are fewer than about 20 usable moments, flag the movie in its notes as too thin for a 60-second Short.

## Standard protocol for every movie (saved from World War Z)

Run these steps in order for each new movie. Don't skip one.

1. **Setup:** `python3.11 scripts/new-explainer.py <movie-slug> <imdb-id>`. This downloads the SDH track into `notes/explainer/<slug>/sdh.srt` and creates `script.md` and `clips.md` templates.
2. **Story script:** write the narration as flowing story (see style below). No colons or semicolons. Put the final text in sheet column D.
3. **Fact check:** fill `script.md` with one row per sentence: the SDH timecode behind each fact, or `UNVERIFIED`. Cut or reword any `UNVERIFIED` fact before rendering.
4. **Clip plan:** pick clips from SDH cues and lines (action first, dialogue only as a hook). Fill `clips.md` with each clip's start, source, and status. Put the plan in sheet column E: `start`, `sentences`, `quote`, `action`. No durations or totals.
5. **Sheet row:** columns D, E, and G only (script, plan, status). Status is `To-do` until steps 1–4 are done.
6. **Render:** the render does the timing, caption options, and length check. Set status to `READY_FOR_LOCAL_RENDER` once steps 1–5 pass.
7. **Notification** on completion or failure.

**Before a row is READY_FOR_LOCAL_RENDER:**
- Every script fact is sourced or cut.
- Every clip start comes from an SDH cue or line.
- Sentence ranges cover every sentence once, in order.
- Every clip marked unverified in `clips.md` is either replaced with a sourced cue or line, or removed.

## Fact checking: SDH subtitles check the story, they don't write it

- Write the narration as a story first, using the narration style below. Don't copy SDH wording into the script.
- Fetch the SDH track (OpenSubtitles, hearing-impaired flag) and use it to check every plot fact: names, places, roles, numbers, and events.
- Keep a notes file per movie (`notes/explainer/<movie>-script.md`). For each sentence, record the SDH timecode that supports its facts, or mark it as narration (connective wording, not a fact).
- Any plot fact not found in SDH must be marked `UNVERIFIED` in the notes. Either confirm it from another source, or reword it so it doesn't claim something the film doesn't show.
- Commentary ("this changes everything") is narration, not a fact, so it doesn't need a source. Keep it short and don't present it as plot.
- Clip picks come from SDH cues and lines, as before.

## Narration style (write it like a story, not a list)

The voiceover is the product. Short, isolated facts sound flat and robotic, so write the script as a flowing story.

- **Open with a hook** that makes the stakes clear in the first sentence.
- **Link beats with cause and effect.** Use "So," "Then," "But," or "Until" to connect one event to the next, so each line follows from the last.
- **Say what the character stands to lose or gain** in each beat. Viewers need to know why the next shot matters.
- **Use longer sentences with commas** for flow. Keep a short line only when it's a deliberate punch, and never as a filler fact.
- **End on the payoff**, not on a flat summary.
- **Avoid lists of facts.** If a line could be swapped with another line and nothing would change, rewrite it.
- **Stay faithful to the film.** Check any plot detail against the subtitle or SDH file before it goes in the script.

Example of the difference:

- Flat: "Gerry has no choice."
- Better: "Gerry has no choice, and the clock is already running."

## Workflow for a new movie

1. Get the script from the user. Split it into sentences and number them from 0. Show the numbered list to the user before writing any JSON.
2. Get the subtitle file for the movie (`/admin/explainer` can save one by TMDB ID). Use it to find dialogue for each beat.
3. Group sentences into beats of about 2.5 seconds or more of narration, since very short sentences cannot hold a clip.
4. For each beat, choose clips whose footage matches the sentence. Use dialogue timecodes from the subtitle file as starts, and mark `UNVERIFIED` where you have not checked the picture.
5. Assign `sentences` ranges, keep clip count per beat between 1 and 4, and keep the list chronological by `start`.
6. Validate before writing to the sheet: every sentence index is covered, indices are in range, starts increase, JSON parses, and column F is empty.
7. Write only columns D, E, and G for that row.

## Checks before you say a row is done

- Run `scripts/explainer-align.py` on a test render of the script, or confirm the sentence count matches the number of sentence indices used.
- Report to the user: sentence count, clip count, and any `UNVERIFIED` clips.
- Say clearly what you could not verify. Do not state that footage matches the narration unless you checked it.

## When you don't know

Say so. Ask for the subtitle file, a frame reference, or the movie's timecodes. Never fill a gap with a plausible-looking timestamp.
