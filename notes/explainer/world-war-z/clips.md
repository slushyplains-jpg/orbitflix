# World War Z: explainer clip verification

Sheet row: `Sheet1` row 2 (TMDB 72190, IMDb tt0816711). Narration is 18 sentences; the clip plan is 15 clips.

## Sources

- **Regular subtitles:** `World.War.Z.2013.UNRATED.720p.BluRay.x264-SPARKS.srt` (OpenSubtitles, most downloaded English track).
- **SDH subtitles:** `World.War.Z.2013.UNRATED.720p.BluRay.x264-SPARKS.srt` with hearing-impaired flag (OpenSubtitles file 1953706915). Same release name, so timings should match the regular track.

Both files come from one release. The stream may still be offset from this release, so every start must be checked in the render.

## Method

1. Each clip's quote must appear in a subtitle or SDH line at the clip's start time.
2. Sound cues come from SDH only, for example `(SINGING AMPLIFIED)`.
3. If no line or cue matches, the clip is marked UNVERIFIED and its quote is blank.
4. A match means the start time and quote are confirmed in the subtitle file. It does **not** mean the picture was checked.

## Clip status

| Clip | Start (s) | Quote / cue | Source | Status | Sentences |
|---|---|---|---|---|---|
| 1 | 123.12 | "if the virus changes in a way that allows transmission between humans." | regular SRT | subtitle match | 0–2 |
| 2 | 257.72 | "The government has declared martial law." | regular SRT | subtitle match | 0–2 |
| 3 | 379.52 | "Hold on, guys." | regular SRT | subtitle match (was 377.4) | 3–4 |
| 4 | 1499.96 | (HELICOPTER APPROACHING) | SDH cue | cue match (was 1472.12) | 3–4 |
| 5 | 1751.84 | "We're not dropping anchor again." | regular SRT | subtitle match (exact) | 5–7 |
| 6 | 2194.76 | "Mother Nature is a serial killer." | regular SRT | subtitle match (was 1859.96, wrong) | 5–7 |
| 7 | 2252.0 | none | none | UNVERIFIED (no C-130 or rain cue in SDH) | 8 |
| 8 | 3395.48 | "And yet you build a wall because you read a communique" | SDH line | line match (exact time) | 9–11 |
| 9 | 3559.0 | (SINGING AMPLIFIED) | SDH cue | cue match (exact) | 9–11 |
| 10 | 3633.2 | "They're coming over the top!" | regular SRT | subtitle match (exact) | 9–11 |
| 11 | 4660.44 | (SNARLING) | SDH cue | cue match (was 4660.0) | 12–15 |
| 12 | 4762.8 | "Mayday, mayday, mayday! Bravo 160 heavy." | regular SRT | subtitle match (was 4760) | 12–15 |
| 13 | 5314.2 | "Thierry, I'm with a couple of nervous gentlemen." | SDH line | time match only; the call is not confirmed to be inside the WHO facility | 12–15 |
| 14 | 6418.12 | "He's going to inject himself." | SDH line | line match (exact time) | 16–17 |
| 15 | 6655.08 | "He just walked right past him!" | regular SRT | subtitle match (exact) | 16–17 |

## Changes made to the sheet

- Corrected starts: clips 1, 2, 3, 4, 6, 8, 11, 12, 13, 14 were moved to subtitle or cue times.
- Clip 6 was the largest error: 1859.96s changed to 2194.76s (about 5.5 minutes).
- Clip 7 remains UNVERIFIED with a blank quote.
- Durations and totals are not stored in the sheet; the render measures them.

## Rework (action-first picks)

The first pass matched clips to dialogue lines, which gave mostly talking faces. The rework picks SDH action cues (explosions, crashing, snarling, screaming, gunshots, thuds, growling) and keeps dialogue only where it is the hook.

| Clip | Start (s) | Cue or line | Narration sentences |
|---|---|---|---|
| 1 | 409.0 | (EXPLOSION) (PEOPLE GASP) | 0–2 |
| 2 | 552.0 | (SNARLING) | 0–2 |
| 3 | 429.8 | (CLAMORING) (CRASHING) | 3–4 |
| 4 | 1499.0 | (HELICOPTER APPROACHING) | 3–4 |
| 5 | 1751.84 | "We're not dropping anchor again." (dialogue, carrier shot) | 5–7 |
| 6 | 2194.76 | "Mother Nature is a serial killer." (dialogue, war room) | 5–7 |
| 7 | 2396.0 | (ZOMBIE SNARLING) (GUNSHOT FIRING) | 8 |
| 8 | 3573.0 | (SNARLING) | 9–11 |
| 9 | 3637.0 | (PEOPLE SCREAMING) | 9–11 |
| 10 | 3690.0 | (SNARLING) (SCREAMING) | 9–11 |
| 11 | 4656.0 | (THUD) | 12–15 |
| 12 | 4734.0 | (SNARLING) | 12–15 |
| 13 | 4762.8 | "Mayday, mayday, mayday! Bravo 160 heavy." | 12–15 |
| 14 | 6408.0 | (GROWLING), leads into the injection line at 6418.12 | 16–17 |
| 15 | 6655.08 | "He just walked right past him!" | 16–17 |

**Known issues:**
- Clips 5 and 6 are still dialogue. No action cue fits the carrier or the war room, so they need a visual check to confirm they aren't talking heads.
- Clip 2 is a guess for "rabid bite"; the closest cue is (SNARLING). Confirm the picture.
- Start times are cue times, not verified pictures. Every clip still needs a visual check.
- Clip starts don't increase across groups, because the narration order differs from the film order. The parser's chronological-order warning will appear for this row. It can be removed if you're happy with the picks.

## Still to do

- [ ] Watch the stream at each start time and confirm the picture matches the action. Nothing here is checked visually yet.
- [ ] Check the stream offset against one known line (e.g. "He just walked right past him!" at 6655.08s). If the stream is shifted, apply one offset to all clips.
- [ ] Find a visual match for clip 7 (C-130 landing in storm, Camp Humphreys) and clip 13 (WHO facility).
- [ ] Clip 4's cue is the helicopter approaching, not the door opening. Confirm the picture.
