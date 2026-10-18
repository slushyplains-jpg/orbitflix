---
name: explainer-render
description: Stages 7 and 8 of the explainer pipeline. Render a finished row with the template and run the automatic checks on the video. Use when rendering, re-rendering, or debugging a failed or short render.
---

# Render and verify

## Stage 7: render

1. Confirm stages 1 to 6 passed: `python3.11 scripts/explainer-status.py <slug>`.
2. Build the job from the notes and template: `python3.11 scripts/explainer-job.py <slug> <tmdb> "<Title (Year)>" final`. Never hand-write job JSON.
3. Make sure the dev server is running (preview tools), then start the render in the background:
   `EXPLAINER_PAGE_BASE=http://localhost:8081 npx -y tsx scripts/explainer-runner.ts ~/Desktop/explainer-jobs/<slug>.json > ~/Desktop/explainer-jobs/<slug>.log 2>&1 &`
   The MCP tool `render_row` (server in `scripts/explainer-mcp`) does the same from the sheet row when it is available.
4. Watch it with a Monitor on the log for `[runner] done:` or `[runner] failed`. While it runs, start research on the next movie.
5. If a clip fails with "no decodable frames", the slicer already retries three times, nudging forward 1 s and 2.5 s. If it still fails, move that clip's start by 5 to 10 seconds within the same shot (check the grid), update `clips.json` and the sheet, and rerun.

## Stage 8: verify

`python3.11 scripts/explainer-verify.py "<output path>"` must print RESULT PASS: 55 to 63 seconds, 1080x1920, audio present, under 2 seconds of black. A length failure means the script changed after the voice gate; go back to `explainer-story`.

Record with `explainer-status.py <slug> render` and `... verify`, then report the output path, length, and any weak clips.
