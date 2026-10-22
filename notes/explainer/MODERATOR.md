# Daily moderator: make 4 explainer Shorts without any input

You are the daily moderator for the explainer Shorts pipeline in `/Users/mac/Desktop/dreamstream-cinema`. Goal: finish 4 new Shorts today and report. Never ask the user anything. You only coordinate: do not research, write, pick clips or render yourself; workers do that, one Short each, one at a time (never in parallel, they would fight for the CPU).

## 0. Setup

1. Load `mcp__ccd_session_mgmt__set_session_model` and `mcp__ccd_session_mgmt__get_usage` with ToolSearch, then set this session's model to `claude-haiku-5-5` so coordinating stays as cheap as possible. (Only the moderator is Haiku; the workers you start below use Sonnet.) Follow this file literally, one step at a time. When something is unclear, take the simplest safe action (skip a movie, stop the loop) and say so in the report; never guess at file edits.
2. Load and call `mcp__ccd_host__request_keep_awake` so the Mac does not sleep during the run.
3. Note the start time (`date +%H:%M:%S`) and call `get_usage` (5-hour and weekly percentages). If the weekly figure is 90 or more, or the 5-hour figure is 75 or more, stop: do not start anything, send a push notification saying today's run was skipped to protect the usage limit, and end.
4. Make sure the ORBIT site is running, because workers need it to get the stream: call `mcp__Claude_Browser__preview_start` with name `dreamstream-cinema` (load it with ToolSearch; if it says the server is already running or was reused, that is fine), then check that some port answers: `for p in $(seq 8080 8090) $(seq 3000 3010); do curl -s -m 5 http://localhost:$p/ | grep -q "<title>ORBIT" && echo up on $p; done`. If none answers after 30 seconds, stop and send a push notification saying the site would not start.
5. Run `cd /Users/mac/Desktop/dreamstream-cinema && python3.11 scripts/explainer-next.py --left`. If fewer than 4 movies are left, make what is left and say in the report that the queue needs refilling.

## 1. Make 4 Shorts, one after the other

Repeat until 4 Shorts are done, or 8 worker attempts have been made, or a usage limit applies:

1. Call `get_usage`. Stop the loop and report how many were made if any of these is true: the 5-hour figure is 85 or more; the weekly figure is 92 or more; or the weekly figure has gone up by 6 or more points since the start of this run (a daily cap, so one bad day cannot use up the week).
2. Start one worker with the Agent tool: `subagent_type: "general-purpose"`, `model: "sonnet"`, `run_in_background: false`, and the worker prompt below. Each worker has its own fresh context, so yours stays small.
3. When it returns, find the slug in its reply and check `python3.11 scripts/explainer-status.py <slug>`. If the last line says `next: done`:
   - Move its video from `/Users/mac/Documents/Recap/` into `/Users/mac/Documents/Recap/<today as YYYY-MM-DD>/` (create the folder; if the file name has a " (2)" or similar suffix, rename it to `<Title> (<Year>).mp4`).
   - Run `python3.11 scripts/explainer-next.py --log <slug> "<length> s, <minutes> min, <number> weak clips"`.
   - Count it as done.
4. If it is not done: start one more worker for the same movie (it resumes from the stage it reached). If that also fails, run `python3.11 scripts/explainer-next.py --skip <slug> "<one-line reason>"` and carry on; the skipped movie does not count, so the next one replaces it.
5. Do not edit skills, scripts, the queue or any notes by hand. Only the commands above.

### Worker prompt (use word for word, nothing else)

> Make the next explainer Short in /Users/mac/Desktop/dreamstream-cinema by following .claude/skills/explainer-pipeline/SKILL.md exactly, starting with `python3.11 scripts/explainer-next.py`. The ORBIT dev server is already running; do not start another. Never print stream URLs or tokens. Do not edit skills or scripts, and do not commit or push. If a step fails twice, stop and say why. Reply in under 120 words: the movie slug and title, the output path, the video length, the minutes taken, and every clip that does not clearly show its sentence, plus one line on any command that misbehaved.

## 2. Finish

1. Call `get_usage` again and work out how much the run used.
2. Send a push notification (load `PushNotification` with ToolSearch): "N of 4 Shorts ready in Documents/Recap/<date>".
3. Reply with a short report: for each Short, the title, the file path, the length and the weak clips; any skipped movies and why; the usage before and after; the total time. Do not commit or push anything.
