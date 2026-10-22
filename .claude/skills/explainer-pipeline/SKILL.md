---
name: explainer-pipeline
description: How to make one explainer Short end to end (pick the movie, research, script, checks, footage, render). Start here for any request to make, redo or continue an explainer Short. This file has everything a run needs; the other explainer skills are short references.
---

# Make one explainer Short

One fresh session per movie, on Sonnet. About 10 to 12 minutes. Keep turns few: each command below does several things.

## 1. Pick the movie (1 command)

`python3.11 scripts/explainer-next.py` takes the next movie from `notes/explainer/queue.csv`, downloads its subtitles if missing, finds the TMDB id, writes `movie.json` and the subtitle digest, and prints the slug and the next stage. Use `explainer-next.py <slug>` for a specific movie. If a later stage is next, continue from that step below.

## 2. Research (2 reads, 1 write)

- WebFetch the film's Wikipedia page: the plot as numbered beats, who is who, the ending marked.
- Read `notes/explainer/<slug>/sdh_digest.txt` once, whole (dialogue and sound cues with times). The best human details are there.
- Write `story.md` with these four fields:
  - **Premise:** one plain sentence: who, where, what goes wrong.
  - **Wild facts:** 3 to 5 surprising true details, with times. The hook comes from here.
  - **Moments:** the 3 or 4 moments the Short tells, each with the time it is on screen: the hook moment (the most shocking thing, ideally a choice), the human moment (someone we get attached to, and what happens to them), the big turn, the cliffhanger.
  - **Hold back:** the climax and the ending.

## 3. Write (2 writes)

`script.txt`, the narration:
- 3 or 4 moments only, each in 3 to 6 sentences: where we are, what happens, what it costs, and one short line that lets it land ("She has to live with that."). Skipped events get one bridge line ("Then it gets worse."), never a summary.
- About 230 words, 15 to 22 sentences.
- Every sentence is something you can see on screen. No backstory told in dialogue, no side stories, no "he studies biology".
- Words a 10-year-old knows. Say what the danger is (never "something" twice). Say cause and effect out loud. No clever lines. Present tense, active voice, at most two says/asks/tells.
- Never reveal the ending; stop on the dilemma just before the climax. No colons, semicolons, double quotes, or abbreviations with periods.

Example (Underwater, approved): "Norah works at the bottom of the ocean, in a giant underwater base. One day, the walls crack, and water starts pouring in. Her friends are on the other side of a door, running and screaming for her to wait. But if she waits, the water floods the whole base, and everyone dies. So Norah closes the door. She has to live with that." ... "Three people. Two boats. And Norah is the one who has to decide who stays behind."

`script.md`:
- First line: `Moments: (1) the door, 0 to 6; (2) the plan, 7 to 9; (3) Paul, 10 to 16; (4) two boats, 17 to 22` (3 or 4, checked).
- Then a table `| # | Sentence (short) | Picture | Source |`. # is the 0-based sentence number or a range like `4-5`. **Picture** is the time the thing is ON SCREEN: use sound and action cues and the scene order, not the line where someone talks about it, and give sentences about one image the same Picture time. **Source** is the subtitle times that prove the sentence, and/or "plot summary".

Write these files with the Write tool and fix them with the Edit tool. Never edit text with Python, sed or other code.

## 4. Check, voice and footage (1 command)

`python3.11 scripts/explainer-prep.py <slug>` (Bash timeout 600000) runs the fact check and lint, then the voice and the footage tool at the same time: subtitle-to-stream sync, beats, grids, two candidate sheets. It needs the ORBIT dev server; start it with `preview_start` "dreamstream-cinema" if no site answers. If a check fails, fix with Edit and rerun. WARN lines are advice: fix one only if that line reads badly. The voice fixes small length misses by speed; if it is far off, add story or cut the weakest sentence, never pad.

## 5. Pick clips (2 reads, 1 edit)

Read `candidates_1.jpg` and `candidates_2.jpg`. For each beat: would a viewer hearing the sentence nod at this picture? It must show the subject (the person, the creature, the door), not people talking about it. Then rewrite `picks.txt` with ONE Write call (all 14 lines), not one edit per line: keep `a` only if it passes, else `b` or `c`. If none passes, or a beat says NONE, open that beat's `shots/<name>.jpg` once and write a time (m:ss) that shows it, never a red DARK frame. If the film never shows a sentence clearly, take the closest picture and note it in the report; do not rewrite the script at this point. B01 is the hook: take the most striking frame that fits.

## 6. Render and verify (1 command)

`python3.11 scripts/explainer-finish.py <slug>` (Bash timeout 600000; rerun with `--wait-only` if it times out). It builds the clip plan from `picks.txt`, renders with the saved voice, and verifies the video (57 to 61 s, 1080x1920, audio, little black, captions).

## 7. Report

The output path, the length, the time taken, and any clip that does not clearly show its sentence. Do not commit or push notes.

## Rules

- The commands record each stage; never record by hand. `python3.11 scripts/explainer-status.py <slug>` shows where a movie is; `--reset <stage>` redoes from that stage.
- Never print stream links or tokens, and never save them in `notes/`.
- If a step fails twice, stop and report. Do not write new code during a run.
- When a Short comes out bad, fix this skill or a check, not only that movie.
