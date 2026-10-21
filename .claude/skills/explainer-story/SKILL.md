---
name: explainer-story
description: Stages 2 to 4 of the explainer pipeline. Write the narration from the story bible, then pass the script linter and the voice-length check. Use when writing or rewriting any explainer script, or when a script is boring, too short, or reads like a list of who said what.
---

# Story: the script

The voiceover is the product. Write a story the viewer cannot scroll past, then prove it is the right length before any footage work.

## Before you write

Read `notes/explainer/<slug>/story.md` (from `explainer-research`). If it is missing or thin, go back to research. Do not write from the subtitles alone.

## Stage 2: write

Read `examples.md` in this folder first. It has approved scripts with each sentence's job labeled, a "same beat, two ways" pair, and a rejected script. The checks only catch rule-breaking, so quality comes from this stage. It is the cheapest stage in tokens, so do it carefully.

1. **Write three hook options** in `hooks.md`. A hook puts a person in a situation that costs them something, in one concrete image that makes the viewer ask how or why. Not a gag, not a summary. Pick the strongest and say why in one line.
   - Weak: "Four friends go hiking in Sweden."
   - Strong: "Luke hid behind a shelf while his best friend was beaten to death, and did nothing."
2. **Write the spine in `spine.md`**, three lines: (a) what the protagonist believes or has promised, (b) the scene where they must choose against it or for it (from `story.md` "The choice", with times), (c) what it costs. The script is built around this scene. Give it about 40 percent of the words, told closely in the present tense (who does what, what is seen and heard). Every other beat gets one short sentence. Use the "Human detail" once, early or at the turn. Add a fourth line `Model line: ...` copied word for word from a sentence in `examples.md` that matches the job you are about to write (for example the hook). The fact check verifies the line really is in `examples.md`, so the file has to be opened.
3. **Write three drafts** in `drafts/draft_a.txt`, `draft_b.txt`, `draft_c.txt`, about 230 words each, from three different angles:
   - **A, the choice:** open on the cost of the choice (the hook), rewind to what led to it, play the choice scene, end on the open question.
   - **B, one scene:** tell the single most tense sequence moment by moment, compress everything before it to setup, stop before it ends.
   - **C, the clock:** build on a ticking clock or a question the viewer wants answered, and keep raising it.
   Do not polish. Drafts are cheap; keep each short.
4. **Cold read.** Start a fresh helper that has not seen the notes (Agent tool, `subagent_type: "general-purpose"`, `model: "sonnet"`, `run_in_background: false`) and give it only the three drafts with this prompt:
   > You are a viewer who has never seen the film. Below are three narration drafts for a 60 second vertical video. For each draft answer briefly: (1) what it is about, in one line; (2) who you care about, if anyone; (3) the sentence number where you first got bored or confused; (4) whether the first sentence would stop your scroll, yes or no and why. Then score each draft from 1 to 5 on Hook, Clarity, Curiosity, Emotion, Voice. Pick the best draft and list its three weakest sentences by number with a one line reason each. Be harsh. Reply in under 200 words. DRAFT A: ... DRAFT B: ... DRAFT C: ...
5. **Choose by the cold read, not by your own favorite.** Take the best draft, rewrite its three weakest sentences, and borrow at most one strong line from another draft. Save the result as `script.txt`. Write `cold_read.md` with the scores, `Chosen: <A|B|C>`, the three weak sentences, and what you changed.
6. **Style rules.**
   - Present tense. Show actions, not retold dialogue. At most two "says/asks/tells" in the whole script.
   - People carry the story. Name the protagonist and up to four others, each introduced once with their role on first mention ("Hugh, the biologist who woke it"), and only if the name carries feeling or the viewer must track them. Everyone else is a role. Never cast the whole script as roles ("an engineer", "the commander", "one of them"): at most two such phrases.
   - The protagonist acts. In every escalation someone chooses something; things do not just happen. The choice scene must appear.
   - Mix sentence lengths. Use 3 to 6 word lines for punches, and allow two or three short reaction lines ("That is the mistake.", "Nobody moves.").
   - Each sentence answers the last question and opens a new one. If a line could be cut without loss, cut it. Avoid "Then ... then ..." chains.
   - No colons, semicolons, double quotes, or abbreviations with periods (Mr., Mrs., Dr., U.S.). They break the sentence split.
   - Never reveal the ending. Never end on a template question ("What is out there?", "Will they make it?"). End on the most specific open question.
7. **Fact check** in `script.md`: a table `| # | Sentence (short) | Source |` where # is the 0-based sentence number or a range like `4-5`, and Source has the SDH times (3:59, 1:02:14) and/or "plot summary". Before writing a row, grep `sdh.srt` near the cited time and confirm the line says what the sentence claims, including who does it. Cut or reword anything unconfirmed. Then run `python3.11 scripts/explainer-factcheck.py <slug>`; it must print RESULT PASS (it also checks that the spine, three drafts and the cold read exist).

## Stage 3: lint gate

`python3.11 scripts/explainer-lint.py notes/explainer/<slug>/script.txt` and `python3.11 scripts/explainer-factcheck.py <slug>` must both print RESULT PASS. Fix every WARN too unless there is a clear reason, and if you keep one, note the reason in `script.md`.

## Stage 4: voice gate

The linter prints an estimated voice length (within about 1 s). Adjust the script until the estimate is 58 to 60 s before running the voice check, so the slow voice check normally runs once.


`python3.11 scripts/explainer-voicecheck.py notes/explainer/<slug>/script.txt` must print PASS (57 to 61 seconds with the `final` template's voice and speed). If it fails, it says how many words to add or cut. Change the script, then rerun both gates.

Run the checks in this order: `explainer-factcheck.py <slug>` (records research and story), then the linter (records lint), then the voice check (records voice). Do not record stages by hand.
