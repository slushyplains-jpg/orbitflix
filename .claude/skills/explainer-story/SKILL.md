---
name: explainer-story
description: Stages 2 to 4 of the explainer pipeline. Write the narration from the story bible, then pass the script linter and the voice-length check. Use when writing or rewriting any explainer script, or when a script is boring, too short, or reads like a list of who said what.
---

# Story: the script

The voiceover is the product. A viral recap is a friend telling you a crazy story fast: within seconds you know what the movie is, you get one jaw-drop detail after another, and you have to know how it ends. Write that, then prove the length.

## Before you write

Read `notes/explainer/<slug>/story.md` (from `explainer-research`) and `examples.md` in this folder. `examples.md` has the target voice (a real viral recap the user chose) with every sentence's job, our approved script in that voice, and rejected scripts with what was wrong.

## Stage 2: write (one draft, then the viral check)

1. **Hooks** in `hooks.md`: three options taken from the "Wild facts", pick one and say why in one line. End the file with `Model line: ...` copied word for word from a sentence in `examples.md` (the fact check verifies it).
   A hook is one sentence a stranger understands instantly: a person in a concrete, slightly unbelievable picture. Patterns: an impossible act ("A 60-year-old grandmother stops a sports car by lifting it with one hand."), a terrible choice ("At the bottom of the Mariana Trench, Norah shuts a door on her own screaming coworkers."), a wrong detail in a normal scene, a number with stakes. Never open with the title, the actors, a year, or a mood ("In a world where...").
2. **Pick 3 or 4 moments, not the whole movie.** A 60 second Short can only make people feel 3 or 4 things. Choose them from the HIGH beats in `story.md`:
   - **The hook moment:** the most shocking or impossible thing, ideally a choice the protagonist makes.
   - **The human moment:** someone the viewer gets attached to (the "Human detail"), and what happens to them.
   - **The big turn:** the scariest or most surprising thing before the end.
   - **The cliffhanger:** the dilemma just before the climax.
   Everything else is cut, or covered by one bridge sentence ("And it is only the beginning.", "Then it gets worse.", "The only way out is a crazy plan."). Never summarize the skipped events.
3. **Write each moment in 3 to 6 sentences:** where we are, what happens, what it costs, and one short line that lets it land ("She has to live with that.", "Three people. Two boats."). About 230 words and 15 to 22 sentences in total (the 14 cuts need at least 14). If a sentence brings a new event, the next one should usually stay with it.
4. **Simple words.** Write for someone half paying attention on a phone:
   - Words a 10-year-old knows. Say "an underwater base", not "a drilling station"; "the base is about to blow up", not "the reactor is melting"; "heavy diving suits", not "pressure suits".
   - One idea per sentence. Most sentences under 15 words, a few longer ones to carry the story.
   - Say what the danger is ("a creature with no eyes", "a man with an axe"). Never "something" more than once.
   - Say the cause and the effect out loud ("If she waits, the water floods the whole base, and everyone dies."). Nothing the listener has to work out.
   - No clever lines, irony or wordplay that needs a second listen.
   - Present tense, active voice. Show what happens; do not retell dialogue. At most two says/asks/tells.
   - Specific, true details beat general ones (a bathrobe, a stuffed bunny named Lil Paul). Check every detail against the subtitles; a wrong detail kills trust faster than a dull one.
   - Never: the ending, a template ending ("Will they survive?"), colons, semicolons, double quotes, or abbreviations with periods.
   The linter measures the reading level and lists hard words; it fails a script that is too hard to follow.
5. **Viral check.** Start `script.md` with a `## Viral check` section and answer each in one line. If an answer is weak, rewrite that part first:
   - Scroll: why sentence 1 stops a thumb.
   - Premise: the movie in one line, as the script has told it by sentence 5.
   - Root for: who, and the detail that makes us care.
   - Moments: the 3 or 4 moments with their sentence numbers (more than 4 means it is too rushed).
   - Ending: the exact question the viewer has at the last word.
   - Cut: the weakest sentence in the draft, and what replaced it.
6. **Fact check** in `script.md`, under the viral check: a table `| # | Sentence (short) | Source |` where # is the 0-based sentence number or a range like `4-5`, and Source has the SDH times (3:59, 1:02:14) and/or "plot summary". Before writing a row, look at `sdh.srt` near the cited time and confirm the line says what the sentence claims, including who does it. Then run `python3.11 scripts/explainer-factcheck.py <slug>`; it must print RESULT PASS. It also checks the story.md fields, the Model line in hooks.md, and the viral check.

## Stage 3: lint gate

`python3.11 scripts/explainer-lint.py notes/explainer/<slug>/script.txt` and `python3.11 scripts/explainer-factcheck.py <slug>` must both print RESULT PASS. Fix every WARN too unless there is a clear reason, and if you keep one, note the reason in `script.md`.

## Stage 4: voice gate

The linter prints an estimated voice length (good to about 2 s). Adjust the script until the estimate is 58 to 60 s before running the voice check, so the slow voice check normally runs once.


`python3.11 scripts/explainer-voicecheck.py notes/explainer/<slug>/script.txt` must print PASS (57 to 61 seconds with the `final` template's voice and speed). If it fails, it says how many words to add or cut. Change the script, then rerun both gates.

Run the checks in this order: `explainer-factcheck.py <slug>` (records research and story), then the linter (records lint), then the voice check (records voice). Do not record stages by hand.
