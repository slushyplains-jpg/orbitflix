---
name: explainer-pipeline
description: The master plan for making explainer Shorts, end to end. Start here for any request to make, redo, batch, or schedule explainer Shorts, or to continue a movie that is partway done. It runs the stages in order (research, story, lint, voice, footage, render, verify), names the skill that owns each stage, and blocks any stage until the one before it has passed its check.
---

# Explainer pipeline

Every Short goes through the same seven stages. Each stage has an owning skill and a gate: a script that must pass before the next stage starts. Gates are scripts, not judgment, so a skipped check cannot slip through.

## Stages

| # | Stage | Owning skill | Gate that must pass |
|---|---|---|---|
| 1 | research | `explainer-research` | `story.md` exists with every field filled |
| 2 | story | `explainer-story` | three hook options written, one chosen |
| 3 | lint | `explainer-story` | `python3.11 scripts/explainer-lint.py notes/explainer/<slug>/script.txt` prints RESULT PASS (run after the fact check) |
| 4 | voice | `explainer-story` | `python3.11 scripts/explainer-voicecheck.py notes/explainer/<slug>/script.txt` prints PASS (57 to 61 s) |
| 5 | footage | `explainer-footage` | `explainer-clips.py <slug>` prints RESULT PASS (14 clips) |
| 6 | render | `explainer-render` | `explainer-finish.py` prints done |
| 7 | verify | `explainer-render` | the video check inside `explainer-finish.py` prints RESULT PASS |

Each check script records its own stage when it passes (`explainer-factcheck.py` records research and story, the linter records lint, the voice check records voice, `explainer-clips.py` records footage, `explainer-finish.py` records render and verify), so do not run `explainer-status.py` by hand to record. The tracker refuses to record a stage whose earlier stages have not passed. The Google Sheet is no longer written; the notes folder and the video are the record. Run `python3.11 scripts/explainer-status.py <slug>` first on any movie to see where to resume. To redo a movie, send it back with `--reset <stage>` (for example `--reset research` for a full rewrite). `--accept` is only for a video the user has explicitly approved that was made before this pipeline existed.

## Which model does what

Each movie is made by two helpers started with the Agent tool. The session that runs the pipeline only coordinates: it checks status, starts the helpers, and reports. This keeps cost low whatever model the session itself runs on.

1. **Stages 1 to 4 (research, story, lint, voice): Sonnet.** If this session itself runs on Sonnet, do these stages yourself by following `explainer-research` and `explainer-story`; that saves a helper's startup. Otherwise start a Sonnet helper with `subagent_type: "general-purpose"`, `model: "sonnet"`, `run_in_background: false`, and this prompt, filled in:
   > You are writing the story for the explainer Short of <Title (Year)>, slug <slug>, TMDB <id>, in /Users/mac/Desktop/dreamstream-cinema. Read and follow `.claude/skills/explainer-research/SKILL.md`, then `.claude/skills/explainer-story/SKILL.md` and its `examples.md`, exactly. Do stages research, story, lint and voice, Run the checks in this order: `explainer-factcheck.py <slug>`, then `explainer-lint.py`, then `explainer-voicecheck.py`; each records its own stage when it passes, and all must print PASS. Do not do footage or anything later. Reply with the final script, its word count and voice length, and anything you were unsure of.
2. **Stages 5 to 7 (footage, render, verify): a Haiku helper.** Start it only after `explainer-status.py <slug>` says `next: footage`. Use `model: "haiku"` and this prompt, filled in:
   > You are making the footage and render for the explainer Short of <Title (Year)>, slug <slug>, TMDB <id>, in /Users/mac/Desktop/dreamstream-cinema. The script is final; do not change script.txt. Do exactly these steps and nothing else: (1) `python3.11 scripts/explainer-footage-auto.py <slug> <id>`; (2) Read `notes/explainer/<slug>/candidates_1.jpg` and `candidates_2.jpg`; (3) edit `picks.txt` only for beats whose candidate a does not match the sentence, using b, c, or a time from that beat's `shots/<name>.jpg`; (4) `python3.11 scripts/explainer-clips.py <slug>` must print RESULT PASS; (5) `python3.11 scripts/explainer-finish.py <slug> <id> "<Title (Year)>" final` in the foreground with timeout 600000, rerunning with `--wait-only` if it times out. If a step fails, read `.claude/skills/explainer-footage/SKILL.md` or `explainer-render` for that step only. Record each stage with `explainer-status.py`. Never print stream URLs or tokens. Reply with the output path, video length, the verify result, and any weak clips.
3. Before starting either helper, make sure the ORBIT dev server answers on a localhost port (start it with the preview tools if not); the Haiku helper needs it.
4. If a helper stops before its last stage, read `explainer-status.py <slug>`, then start a new helper of the same model for the remaining stages. Never do a helper's stages yourself on a different model.

## Rules that apply to every stage

1. **Never skip a gate.** If a gate fails, fix the cause in the owning stage and run the gate again. A failed length check goes back to the story stage, never forward.
2. **Never render before stages 1 to 5 pass.** A render is the most expensive step and the only one the user sees.
3. **One source of truth per file.** Final narration is `notes/explainer/<slug>/script.txt` (no `script_v2.txt`). The clip plan is `clips.json`. `clips.md` is generated by `scripts/explainer-notes.py`, never hand-edited.
4. **Do not hand-write job JSON.** Build it with `scripts/explainer-job.py`.
5. **Report honestly.** Say which gates passed, which clips are weak, and anything not checked.
6. **Keep going.** In a batch, when a render is running in the background, start the next movie's Sonnet helper. Do not wait idle.

## Batch runs (several movies, or the daily task)

- Take movies in sheet order. Skip movies whose status shows `next: done`. A movie with no status file starts at research. Movie order comes from column B of the sheet (read only).
- Work on movie N+1 while movie N renders.
- If a movie cannot pass a gate after two honest attempts (for example the film is too thin to source 228 words), record why in `notes/explainer/<slug>/status.json` via a note on the last passed stage, tell the user, and move to the next movie.

## Folder layout per movie

`notes/explainer/<slug>/` holds `sdh.srt`, `story.md`, `hooks.md`, `script.txt`, `script.md` (fact check), `clips.json`, `clips.md` (generated), `status.json`, and `shots/` grids. Scratch frames go in the scratchpad, not the project.
