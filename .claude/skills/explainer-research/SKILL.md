---
name: explainer-research
description: Stage 1 of the explainer pipeline. Understand the whole film before writing anything, and produce the movie's story bible (notes/explainer/<slug>/story.md). Use when starting a new movie, or when a script reads like a list of dialogue.
---

# Research: the story bible

A script built only from subtitles turns into a transcript recap. Subtitles are dialogue, so they miss most of the plot and the emotional core. Understand the whole film first.

## Steps

1. **Setup.** If the folder has no `sdh.srt`, run `python3.11 scripts/new-explainer.py <slug> <imdb-id>`. Get the TMDB id from `https://api.themoviedb.org/3/find/tt<imdb>?api_key=<key in repo>&external_source=imdb_id`.
2. **Read a full plot summary.** Fetch the film's Wikipedia page (WebFetch) and read the Plot section, plus the TMDB overview. Take notes in your own words. Never paste the summary text into the project.
3. **Make the subtitle digest:** `python3.11 scripts/explainer-sdh-digest.py <slug>` writes `sdh_digest.txt`, half the size of the .srt with every line kept. Read the digest in one go (Read tool, whole file) instead of grepping the .srt many times. **Read it across the whole film, not just the first half.** Pull lines from beginning to end so the story has a real shape. Note the subtitle time for each key moment.
4. **Write `story.md`** with every field below filled. If a field is truly unknown, write why.

## story.md fields

- **Logline:** one sentence, who wants what and what stands in the way.
- **Protagonist:** who the Short follows, described by role.
- **Wound:** the protagonist's guilt, loss, or flaw (this is usually the emotional core).
- **The choice:** the one or two moments where the protagonist gives something up, breaks their own rule, or has to pick between two things they care about, with times. This is the spine of the script. If the protagonist never chooses anything in the film, pick the moment they are most tested. The strongest scene for the protagonist is often not the biggest event.
- **Human detail:** one small, specific, human thing the viewer will remember (a wheelchair that feels like flying, a newborn the father never meets, a promise to a child), with its time. The script must use it once.
- **Goal and stakes:** what they need, and what happens if they fail.
- **Central mystery or threat:** the question the viewer will want answered.
- **Key beats:** 8 to 12 events in film order, each with its subtitle time or "plot summary only", and a power mark. HIGH means someone chooses, sacrifices, breaks a rule or loses someone. LOW means the plot just moves. The script is built from the HIGH beats.
- **Turn:** the midpoint reveal or reversal.
- **Hold back:** the climax and ending. Note them here so the script can tease, not tell.
- **Best images:** 5 to 8 striking visual moments with approximate times (for the hook and for footage).
- **Cliffhanger:** the most specific unanswered question at the point where the Short stops.

The gate for this stage is that every field is filled. `explainer-factcheck.py` checks the fields and records research when the story stage passes.
