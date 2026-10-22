// Renders one explainer row without the admin page.
// Usage: npx -y tsx scripts/explainer-runner.ts <job.json>
// The job file holds the row (title, script, clips), the stream (m3u8Url, or tmdbId to fetch one),
// and the render settings from a template. Progress is written to <job.json>.status.json.
// Fetching a link needs the ORBIT dev server running. Its port is found automatically unless
// EXPLAINER_PAGE_BASE is set. A saved m3u8Url that has expired is replaced with a fresh one.
import { execFileSync, execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { runRenderJob, type ExplainerClip } from "../src/lib/explainerRender";

type Job = {
  title: string;
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  m3u8Url?: string;
  script: string;
  clips: ExplainerClip[];
  outputDir?: string;
  voice?: string;
  ttsSpeed?: number;
  voiceWav?: string;
  enableScan?: boolean;
  look?: string;
  zoom?: number;
  bg?: "blur" | "black";
  blurIntensity?: number;
  overlayText?: string;
  textSize?: number;
  textColor?: string;
  textX?: number;
  textY?: number;
  fontFamily?: string;
  fontStyle?: string;
  captions?: boolean;
  captionColor?: string;
  captionFont?: string;
  captionSize?: number;
  captionTextColor?: string;
  captionStroke?: number;
  captionStrokeColor?: string;
  captionY?: number;
};

const jobFile = process.argv[2];
if (!jobFile) throw new Error("usage: explainer-runner.ts <job.json>");
const job = JSON.parse(fs.readFileSync(jobFile, "utf8")) as Job;
const statusFile = `${jobFile}.status.json`;
const base = process.env.EXPLAINER_PAGE_BASE ?? "";

function writeStatus(state: Record<string, unknown>) {
  fs.writeFileSync(statusFile, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2));
}

function notify(title: string, body: string) {
  execFile("osascript", ["-e", `display notification "${body}" with title "${title}"`], () => {});
}

function linkWorks(url: string): boolean {
  try {
    const code = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "-m", "20",
      "-H", "User-Agent: Mozilla/5.0", "-H", "Referer: https://stellarconductornexus.com/", url], { encoding: "utf8" });
    return code.trim().startsWith("2");
  } catch {
    return false;
  }
}

async function main() {
  const jobKey = `${job.tmdbId ?? "job"}-${Date.now()}`;
  let m3u8Url = job.m3u8Url ?? "";
  // Stream tokens last about four hours, so a saved link may be dead by render time.
  if (m3u8Url && job.tmdbId && !linkWorks(m3u8Url)) {
    console.log("[runner] saved stream link has expired, fetching a fresh one");
    m3u8Url = "";
  }
  // The footage stage caches its link here; reuse it if it is under three hours old and still works.
  const cached = job.tmdbId
    ? path.join(process.env.HOME ?? "", "Desktop/explainer-jobs/.links", `${job.mediaType ?? "movie"}-${job.tmdbId}.txt`)
    : "";
  if (!m3u8Url && cached && fs.existsSync(cached) && Date.now() - fs.statSync(cached).mtimeMs < 3 * 3600 * 1000) {
    const link = fs.readFileSync(cached, "utf8").trim();
    if (linkWorks(link)) {
      console.log("[runner] reusing cached stream link");
      m3u8Url = link;
    }
  }
  if (!m3u8Url) {
    if (!job.tmdbId) throw new Error("job needs m3u8Url or tmdbId");
    // A bare path lets the link fetcher find whichever port the dev server is on.
    const pageUrl = `${base}/${job.mediaType ?? "movie"}/${job.tmdbId}`;
    const linkFile = `${jobFile}.link.txt`;
    writeStatus({ stage: "fetching-link", message: pageUrl });
    console.log(`[runner] fetching stream link from ${pageUrl}`);
    execFileSync("/usr/local/bin/python3.11", [path.resolve("scripts/explainer-get-m3u8.py"), pageUrl, linkFile], {
      stdio: "inherit",
    });
    m3u8Url = fs.readFileSync(linkFile, "utf8").trim();
    fs.rmSync(linkFile, { force: true });
  }

  console.log(`[runner] rendering "${job.title}"`);
  writeStatus({ stage: "preparing", message: "starting render" });
  try {
    const result = await runRenderJob({
      m3u8Url,
      script: job.script,
      clips: job.clips,
      title: job.title,
      outputDir: job.outputDir ?? "",
      jobKey,
      voice: job.voice,
      ttsSpeed: job.ttsSpeed ?? 0.9,
      voiceWav: job.voiceWav,
      enableScan: job.enableScan ?? false,
      look: job.look ?? "none",
      zoom: job.zoom,
      bg: job.bg,
      blurIntensity: job.blurIntensity,
      overlayText: job.overlayText,
      textSize: job.textSize,
      textColor: job.textColor,
      textX: job.textX,
      textY: job.textY,
      fontFamily: job.fontFamily,
      fontStyle: job.fontStyle,
      captions: job.captions ?? false,
      captionColor: job.captionColor,
      captionFont: job.captionFont,
      captionSize: job.captionSize,
      captionTextColor: job.captionTextColor,
      captionStroke: job.captionStroke,
      captionStrokeColor: job.captionStrokeColor,
      captionY: job.captionY,
      onStatus: (s) => {
        writeStatus({ ...s });
        console.log(`[runner] ${s.stage} ${s.clipsDone}/${s.clipsTotal} ${s.message ?? ""}`);
      },
    });
    writeStatus({ stage: "done", path: result.path, voiceoverSec: result.voiceoverSec, videoSec: result.videoSec });
    console.log(`[runner] done: ${result.path} (voice ${result.voiceoverSec.toFixed(2)}s, video ${result.videoSec.toFixed(2)}s)`);
    notify("Explainer render done", job.title);
  } catch (err) {
    const message = (err as Error).message;
    writeStatus({ stage: "error", message });
    console.error(`[runner] failed: ${message}`);
    notify("Explainer render failed", job.title);
    process.exitCode = 1;
  }
}

void main();
