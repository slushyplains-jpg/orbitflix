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

- **Premise:** one plain sentence a stranger understands at once: who, where, and what is going wrong.
- **Protagonist:** name and role, plus the one thing that makes them specific (a job, a past, a habit).
- **Wild facts:** the 3 to 5 most surprising true things in the film, with times. The hook comes from here. A wild fact is concrete and a little unbelievable ("a grandmother lifts a sports car with one hand", "a man flees a sinking station in his bathrobe, holding a stuffed bunny").
- **Human detail:** one small human thing the viewer will remember, with its time.
- **Wound:** the protagonist's loss, guilt or secret, with its time, or "none".
- **Key beats:** 8 to 12 events in film order with times, each marked HIGH (someone chooses, sacrifices, dies, or a big reveal) or LOW (the plot just moves).
- **Twist we can show:** the biggest reveal before the last third of the film, which the Short may use.
- **Hold back:** the climax and the ending. The Short points at them but never tells them.
- **Best images:** 5 to 8 striking visual moments with times (for the hook clip and the footage).
- **Cliffhanger:** where the Short stops, just before the climax, as a specific dilemma or question.

Subtitles hold the best human details (they were where the bunny and the fiancé in Underwater came from), so read the whole digest, not only the plot summary.

The gate for this stage is that every field is filled. `explainer-factcheck.py` checks the fields and records research when the story stage passes.
