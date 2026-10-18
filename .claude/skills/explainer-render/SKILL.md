---
name: explainer-render
description: Stages 7 and 8 of the explainer pipeline. Render a finished row with the template and run the automatic checks on the video. Use when rendering, re-rendering, or debugging a failed or short render.
---

# Render and verify

## Quick path (use this)

`python3.11 scripts/explainer-finish.py <slug> <tmdb> "<Title (Year)>" final` does stages 7 and 8 in one command: it builds the job, starts the detached render, waits, runs the video check, and records both stages. Run it in the foreground with a Bash timeout of 600000 (a helper cannot receive background notices, so never background it or arm a Monitor). If the call times out, run it again with `--wait-only`; repeat until it prints `done:` or a failure. If it stops early, rerun it with `--wait-only`. The steps below explain what it does and how to handle failures.

## Stage 7: render

1. Confirm stages 1 to 5 passed: `python3.11 scripts/explainer-status.py <slug>`.
2. Build the job from the notes and template: `python3.11 scripts/explainer-job.py <slug> <tmdb> "<Title (Year)>" final`. Never hand-write job JSON.
3. Make sure the dev server is running (preview tools; any port, the link fetcher finds it), then start the render with
   `python3.11 scripts/explainer-render-start.py ~/Desktop/explainer-jobs/<slug>.json`
   It runs in its own process session, so it keeps going if this session ends. Never start the runner as a plain background shell job: that dies with the session. The job has no stream link; the runner fetches a fresh one, and replaces any saved link that has expired.
   The MCP tool `render_row` (server in `scripts/explainer-mcp`) does the same from the sheet row when it is available.
4. If a session ended mid-render, check `~/Desktop/explainer-jobs/<slug>.json.status.json` and `pgrep -fl explainer-runner` before restarting, so two renders never run at once.
5. Watch it with a Monitor on the log for `[runner] done:` or `[runner] failed`. While it runs, start research on the next movie.
6. If a clip fails with "no decodable frames", the slicer already retries three times, nudging forward 1 s and 2.5 s. If it still fails, move that clip's start by 5 to 10 seconds within the same shot (check the grid), update `clips.json` and the sheet, and rerun.

## Stage 8: verify

`python3.11 scripts/explainer-verify.py "<output path>" final` must print RESULT PASS: 57 to 61 seconds, 1080x1920, audio present, under 2 seconds of black, and captions visible in the template's caption band in at least 60% of samples. A length failure means the script changed after the voice gate; go back to `explainer-story`.

`explainer-finish.py` records render and verify. Report the output path, length, and any weak clips.
