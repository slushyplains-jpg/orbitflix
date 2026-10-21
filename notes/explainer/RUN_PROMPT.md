# Prompt to make the next explainer Short

Open a new Claude Code session in /Users/mac/Desktop/dreamstream-cinema, pick **Sonnet** in the model picker, and paste:

```text
Make one explainer Short in /Users/mac/Desktop/dreamstream-cinema using the explainer-pipeline skill.

1. Call mcp__ccd_session_mgmt__get_usage and note the 5-hour and weekly percentages and the start time.
2. Read Sheet1!B2:C30 of spreadsheet 1GQ5VKjlPbYsrovwvlo7txLBmbtz387Zwb4it6T4D__s (read only). Take the first movie, in sheet order, whose `python3.11 scripts/explainer-status.py <slug>` does not say "next: done" (slug = title in lowercase with hyphens, no year). Find its TMDB id with the TMDB API as explainer-research says.
3. Make sure the ORBIT dev server answers on localhost (start it with preview_start "dreamstream-cinema" if not).
4. Do every stage yourself, in order, exactly as the pipeline skill and each stage skill say (no helpers): research, story (simple words, 3 or 4 moments, a Picture time for every sentence), the checks, footage picks from the two candidate sheets, then render and verify with explainer-finish.py.
5. When verify passes, commit only that movie's notes (not shots/ or candidates) to the explainer-pipeline branch and push.
6. Call get_usage again and reply with: the movie, the output path, the video length, the total time, the usage before and after, and any weak clips.
```
