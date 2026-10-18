---
name: explainer-story
description: Stages 2 to 4 of the explainer pipeline. Write the narration from the story bible, then pass the script linter and the voice-length check. Use when writing or rewriting any explainer script, or when a script is boring, too short, or reads like a list of who said what.
---

# Story: the script

The voiceover is the product. Write a story the viewer cannot scroll past, then prove it is the right length before any footage work.

## Before you write

Read `notes/explainer/<slug>/story.md` (from `explainer-research`). If it is missing or thin, go back to research. Do not write from the subtitles alone.

## Stage 2: write

Read `examples.md` in this folder first. It has two approved scripts with the job of every sentence labeled, and a rejected one with what was wrong. Write in the same pattern.

1. **Write three hook options** in `hooks.md`. A hook is one short sentence with a concrete, shocking image or fact that makes the viewer ask how or why. Pick the strongest and say why in one line.
   - Weak: "Four friends go hiking in Sweden."
   - Strong: "Luke hid behind a shelf while his best friend was beaten to death, and did nothing."
2. **Write the script in this shape**, about 230 to 240 words (Kokoro speaks 3.8 to 4.1 words a second at 1.0x, so the voice check decides), before thinking about clips:
   - Hook (1 sentence).
   - Setup: who the protagonist is and what they carry, using the wound from the story bible (1 to 2 sentences).
   - Goal and the first mistake (1 to 2 sentences).
   - Three escalations, each caused by the one before. Use "so," "but," "until," or "then" to link them (5 to 7 sentences).
   - The turn: the reveal that changes what is at stake (1 to 2 sentences).
   - Cliffhanger: stop before the climax, on a question only this film can raise (1 sentence).
   **Fill-in outline.** Write one sentence per line below, in order, then join them. Each line takes its content from a `story.md` field, so nothing is invented:
   1. Hook: the wound or the best image, as one concrete picture (Wound or Best images).
   2. Setup: time and place, who they are, why they are there (Protagonist, Goal).
   3. Problem that starts the trouble (first Key beat).
   4. The choice that causes everything, starting "So" (Key beat).
   5 to 7. Escalation 1: one concrete image, then a 3 to 6 word punch, then one extra detail (Key beat, Best images).
   8 to 9. Escalation 2: a new place or danger, then its image (Key beat).
   10 to 11. Escalation 3: the threat touches the protagonist, then a wrong detail (Key beat).
   12 to 13. False hope, then hope breaks (Key beat).
   14. The question the viewer is already asking, as a short sentence (optional).
   15 to 16. The wound comes back: someone blames the protagonist, or the protagonist risks everything for it (Wound, Turn).
   17. The turn: the threat strikes or the stakes jump (Turn).
   18. Cliffhanger: the most specific open question at this point, as a statement, never "will they" (Cliffhanger).
   Merge or split lines to fit the film, but keep the order of jobs.
3. **Style rules.**
   - Present tense. Show actions, not dialogue. At most two "says/asks/tells" in the whole script.
   - Name only the protagonist and at most two others. Everyone else is a role ("his wife", "the guide").
   - Mix sentence lengths. Use a 3 to 6 word sentence for punches.
   - Every sentence must make the viewer want the next one. If a line could be cut without loss, cut it.
   - No colons, semicolons, double quotes, or abbreviations with periods (Mr., Mrs., Dr., U.S.). They break the sentence split.
   - Never reveal the ending. Never end on a template question ("What is out there?", "Will they make it?").
4. **Fact check** in `script.md`: a table `| # | Sentence (short) | Source |` where # is the 0-based sentence number or a range like `4-5`, and Source has the SDH times (3:59, 1:02:14) and/or "plot summary". Before writing a row, grep `sdh.srt` near the cited time and confirm the line says what the sentence claims, including who does it. Cut or reword anything unconfirmed. Then run `python3.11 scripts/explainer-factcheck.py <slug>`; it must print RESULT PASS.

## Stage 3: lint gate

`python3.11 scripts/explainer-lint.py notes/explainer/<slug>/script.txt` and `python3.11 scripts/explainer-factcheck.py <slug>` must both print RESULT PASS. Fix every WARN too unless there is a clear reason, and if you keep one, note the reason in `script.md`.

## Stage 4: voice gate

`python3.11 scripts/explainer-voicecheck.py notes/explainer/<slug>/script.txt` must print PASS (55 to 63 seconds with the `final` template's voice and speed). If it fails, it says how many words to add or cut. Change the script, then rerun both gates.

Record each gate with `explainer-status.py <slug> story|lint|voice`.
