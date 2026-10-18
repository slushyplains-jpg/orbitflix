---
name: explainer-story
description: Stages 2 to 4 of the explainer pipeline. Write the narration from the story bible, then pass the script linter and the voice-length check. Use when writing or rewriting any explainer script, or when a script is boring, too short, or reads like a list of who said what.
---

# Story: the script

The voiceover is the product. Write a story the viewer cannot scroll past, then prove it is the right length before any footage work.

## Before you write

Read `notes/explainer/<slug>/story.md` (from `explainer-research`). If it is missing or thin, go back to research. Do not write from the subtitles alone.

## Stage 2: write

1. **Write three hook options** in `hooks.md`. A hook is one short sentence with a concrete, shocking image or fact that makes the viewer ask how or why. Pick the strongest and say why in one line.
   - Weak: "Four friends go hiking in Sweden."
   - Strong: "Luke hid behind a shelf while his best friend was beaten to death, and did nothing."
2. **Write the script in this shape**, about 220 to 230 words, before thinking about clips:
   - Hook (1 sentence).
   - Setup: who the protagonist is and what they carry, using the wound from the story bible (1 to 2 sentences).
   - Goal and the first mistake (1 to 2 sentences).
   - Three escalations, each caused by the one before. Use "so," "but," "until," or "then" to link them (5 to 7 sentences).
   - The turn: the reveal that changes what is at stake (1 to 2 sentences).
   - Cliffhanger: stop before the climax, on a question only this film can raise (1 sentence).
3. **Style rules.**
   - Present tense. Show actions, not dialogue. At most two "says/asks/tells" in the whole script.
   - Name only the protagonist and at most two others. Everyone else is a role ("his wife", "the guide").
   - Mix sentence lengths. Use a 3 to 6 word sentence for punches.
   - Every sentence must make the viewer want the next one. If a line could be cut without loss, cut it.
   - No colons, semicolons, double quotes, or abbreviations with periods (Mr., Mrs., Dr., U.S.). They break the sentence split.
   - Never reveal the ending. Never end on a template question ("What is out there?", "Will they make it?").
4. **Fact check** in `script.md`: one row per sentence with its subtitle time or "plot summary". Cut or reword anything unconfirmed. Narration framing is allowed, but keep it short.

## Stage 3: lint gate

`python3.11 scripts/explainer-lint.py notes/explainer/<slug>/script.txt` must print RESULT PASS. Fix every WARN too unless there is a clear reason, and if you keep one, note the reason in `script.md`.

## Stage 4: voice gate

`python3.11 scripts/explainer-voicecheck.py notes/explainer/<slug>/script.txt` must print PASS (55 to 63 seconds with the `final` template's voice and speed). If it fails, it says how many words to add or cut. Change the script, then rerun both gates.

Record each gate with `explainer-status.py <slug> story|lint|voice`.
