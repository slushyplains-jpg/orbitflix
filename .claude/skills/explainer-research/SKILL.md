---
name: explainer-research
description: Stage 1 of the explainer pipeline. Understand the whole film before writing anything, and produce the movie's story bible (notes/explainer/<slug>/story.md). Use when starting a new movie, or when a script reads like a list of dialogue.
---

# Research: the story bible

A script built only from subtitles turns into a transcript recap. Subtitles are dialogue, so they miss most of the plot and the emotional core. Understand the whole film first.

## Steps

1. **Setup.** If the folder has no `sdh.srt`, run `python3.11 scripts/new-explainer.py <slug> <imdb-id>`. Get the TMDB id from `https://api.themoviedb.org/3/find/tt<imdb>?api_key=<key in repo>&external_source=imdb_id`.
2. **Read a full plot summary.** Fetch the film's Wikipedia page (WebFetch) and read the Plot section, plus the TMDB overview. Take notes in your own words. Never paste the summary text into the project.
3. **Read the subtitles across the whole film, not just the first half.** Pull lines from beginning to end so the story has a real shape. Note the subtitle time for each key moment.
4. **Write `story.md`** with every field below filled. If a field is truly unknown, write why.

## story.md fields

- **Logline:** one sentence, who wants what and what stands in the way.
- **Protagonist:** who the Short follows, described by role.
- **Wound:** the protagonist's guilt, loss, or flaw (this is usually the emotional core).
- **Goal and stakes:** what they need, and what happens if they fail.
- **Central mystery or threat:** the question the viewer will want answered.
- **Key beats:** 8 to 12 events in film order, each with its subtitle time or "plot summary only".
- **Turn:** the midpoint reveal or reversal.
- **Hold back:** the climax and ending. Note them here so the script can tease, not tell.
- **Best images:** 5 to 8 striking visual moments with approximate times (for the hook and for footage).
- **Cliffhanger:** the most specific unanswered question at the point where the Short stops.

The gate for this stage is simple: every field is filled. Record it with `explainer-status.py <slug> research`.
