export type ExplainerClip = {
  start: number;
  duration?: number;
  sentences?: [number, number];
  quote?: string;
  action?: string;
  visual_prompt?: string;
  needs_visual_scan?: boolean;
};
export type ExplainerStatus = {
  stage: "preparing" | "slicing" | "voiceover" | "scanning" | "assembling" | "done" | "error";
  clipsDone: number;
  clipsTotal: number;
  message: string;
};

export type RenderChild = { kill: () => void; on?: (event: "close", cb: () => void) => void };

type RenderOpts = {
  m3u8Url: string;
  script: string;
  clips: ExplainerClip[];
  title: string;
  outputDir: string;
  jobKey: string;
  voice?: string;
  ttsSpeed?: number;
  enableScan?: boolean;
  zoom?: number;
  look?: string;
  bg?: "blur" | "black";
  blurIntensity?: number;
  overlayText?: string;
  captions?: boolean;
  captionColor?: string;
  captionFont?: string;
  captionSize?: number;
  captionTextColor?: string;
  captionStroke?: number;
  captionStrokeColor?: string;
  captionY?: number;
  textSize?: number;
  textColor?: string;
  textX?: number;
  textY?: number;
  fontFamily?: string;
  fontStyle?: string;
  onStatus?: (s: ExplainerStatus) => void;
  registerChild?: (proc: RenderChild) => void;
};

const FONT_MAP: Record<string, Record<string, string>> = {
  Arial: {
    regular: "/System/Library/Fonts/Supplemental/Arial.ttf",
    bold: "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    italic: "/System/Library/Fonts/Supplemental/Arial Italic.ttf",
    bolditalic: "/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf",
  },
  Impact: {
    regular: "/System/Library/Fonts/Supplemental/Impact.ttf",
    bold: "/System/Library/Fonts/Supplemental/Impact.ttf",
    italic: "/System/Library/Fonts/Supplemental/Impact.ttf",
    bolditalic: "/System/Library/Fonts/Supplemental/Impact.ttf",
  },
  Georgia: {
    regular: "/System/Library/Fonts/Supplemental/Georgia.ttf",
    bold: "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    italic: "/System/Library/Fonts/Supplemental/Georgia Italic.ttf",
    bolditalic: "/System/Library/Fonts/Supplemental/Georgia Bold Italic.ttf",
  },
  Helvetica: {
    regular: "/System/Library/Fonts/Helvetica.ttc",
    bold: "/System/Library/Fonts/Helvetica.ttc",
    italic: "/System/Library/Fonts/Helvetica.ttc",
    bolditalic: "/System/Library/Fonts/Helvetica.ttc",
  },
  "Times New Roman": {
    regular: "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
    bold: "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
    italic: "/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf",
    bolditalic: "/System/Library/Fonts/Supplemental/Times New Roman Bold Italic.ttf",
  },
  "Courier New": {
    regular: "/System/Library/Fonts/Supplemental/Courier New.ttf",
    bold: "/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
    italic: "/System/Library/Fonts/Supplemental/Courier New Italic.ttf",
    bolditalic: "/System/Library/Fonts/Supplemental/Courier New Bold Italic.ttf",
  },
  Verdana: {
    regular: "/System/Library/Fonts/Supplemental/Verdana.ttf",
    bold: "/System/Library/Fonts/Supplemental/Verdana Bold.ttf",
    italic: "/System/Library/Fonts/Supplemental/Verdana Italic.ttf",
    bolditalic: "/System/Library/Fonts/Supplemental/Verdana Bold Italic.ttf",
  },
  "Trebuchet MS": {
    regular: "/System/Library/Fonts/Supplemental/Trebuchet MS.ttf",
    bold: "/System/Library/Fonts/Supplemental/Trebuchet MS Bold.ttf",
    italic: "/System/Library/Fonts/Supplemental/Trebuchet MS Italic.ttf",
    bolditalic: "/System/Library/Fonts/Supplemental/Trebuchet MS Bold Italic.ttf",
  },
};

function buildSliceFilter(opts: Pick<RenderOpts, "zoom" | "bg" | "blurIntensity">): string {
  const z = Math.max(1, Math.min(3, opts.zoom ?? 1));
  const tw = Math.round(1080 * z);
  const blurVal = Math.max(2, Math.round(opts.blurIntensity ?? 20));
  const bgChain =
    (opts.bg ?? "blur") === "blur"
      ? `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=${blurVal}:5`
      : `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,colorchannelmixer=0:0:0:0:0:0:0:0:0:0:0:0`;
  return (
    "[0:v]split[a][b];" +
    `[a]${bgChain}[bg];` +
    `[b]scale=${tw}:-2,crop=1080:min(ih\\,1920),hflip[fg];` +
    "[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=30,setsar=1[v]"
  );
}

export const LOOK_PRESETS: Record<string, string> = {
  none: "",
  sharpen: "unsharp=5:5:0.9:5:5:0.0:5:5:0.0",
  vivid: "eq=saturation=1.25:contrast=1.08,unsharp=5:5:0.5",
  cinematic:
    "colorbalance=rs=-0.1:bs=0.15:rm=0.12:bm=-0.1,eq=saturation=1.08:contrast=1.05,unsharp=5:5:0.3",
  noir: "hue=s=0,eq=contrast=1.15:brightness=-0.02",
  bleach: "eq=contrast=1.35:saturation=0.35:brightness=0.04",
  vintage: "curves=r='0/0.05 1/0.95':b='0/0 0.5/0.42',eq=saturation=0.8,vignette=PI/5",
  night: "colortemperature=temperature=4200,eq=brightness=-0.03",
};

async function buildDrawText(opts: RenderOpts, jobDir: string): Promise<string> {
  const text = (opts.overlayText ?? "").trim();
  if (!text) return "";
  const { writeFileSync } = await import("fs");
  const textSize = opts.textSize ?? 64;
  const textColor = opts.textColor ?? "#ffffff";
  const textX = opts.textX ?? 50;
  const textY = opts.textY ?? 85;
  const fontFile =
    FONT_MAP[opts.fontFamily ?? "Arial"]?.[opts.fontStyle ?? "bold"] ?? "/Library/Fonts/Arial.ttf";
  const lines = text.split("\n");
  const lineSpacingPx = Math.round(textSize * 1.2);
  const totalH = lines.length * lineSpacingPx;
  const baseY = Math.round((textY / 100) * 1920) - Math.round(totalH / 2);
  const cx = Math.round((textX / 100) * 1080);
  return lines
    .map((line, i) => {
      const tf = `${jobDir}/drawtext_${i}.txt`;
      writeFileSync(tf, line, "utf8");
      const xExpr = `max(0\\,min(W-text_w\\,${cx}-text_w/2))`;
      return `,drawtext=textfile='${tf}':fontfile='${fontFile}':fontsize=${textSize}:fontcolor=${textColor}:x='${xExpr}':y=${baseY + i * lineSpacingPx}:shadowcolor=black:shadowx=2:shadowy=2`;
    })
    .join("");
}

async function spawnDone(
  cmd: string,
  args: string[],
  registerChild?: (proc: RenderChild) => void,
): Promise<string> {
  const { spawn } = await import("child_process");
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let out = "";
    let err = "";
    if (registerChild) registerChild(proc);
    proc.stdout?.on("data", (d: Buffer) => (out += d.toString()));
    proc.stderr?.on("data", (d: Buffer) => (err += d.toString()));
    proc.on("close", (code) =>
      code === 0 ? resolve(out) : reject(new Error(`${cmd} failed (${code}): ${err.slice(-400)}`)),
    );
    proc.on("error", reject);
  });
}

function headersFor(url: string): string {
  try {
    const base = new URL(url);
    const origin = `${base.protocol}//${base.hostname}`;
    return [
      `Referer: ${origin}/\r\n`,
      `Origin: ${origin}\r\n`,
      "User-Agent: Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36\r\n",
    ].join("");
  } catch {
    return "";
  }
}

async function resolveStreamUrl(m3u8Url: string): Promise<{ streamUrl: string; headers: string }> {
  if (!m3u8Url.startsWith("http")) return { streamUrl: m3u8Url, headers: "" };
  const headers = headersFor(m3u8Url);
  const masterText = await (
    await fetch(m3u8Url, {
      headers: { Referer: `${new URL(m3u8Url).origin}/`, "User-Agent": "Mozilla/5.0" },
    })
  ).text();

  let bestBandwidth = 0;
  let bestPath = "";
  const lines = masterText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXT-X-STREAM-INF")) {
      const bw = Number(line.match(/BANDWIDTH=(\d+)/)?.[1] ?? 0);
      const next = lines[i + 1]?.trim();
      if (next && !next.startsWith("#") && bw > bestBandwidth) {
        bestBandwidth = bw;
        bestPath = next;
      }
    }
  }
  const baseUrl = new URL(m3u8Url);
  const origin = `${baseUrl.protocol}//${baseUrl.hostname}`;
  let variantUrl = bestPath;
  if (bestPath.startsWith("/")) variantUrl = origin + bestPath;
  else if (bestPath && !bestPath.startsWith("http"))
    variantUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1) + bestPath;
  if (variantUrl && !variantUrl.includes("token=") && m3u8Url.includes("token=")) {
    variantUrl += (variantUrl.includes("?") ? "&" : "?") + "token=" + m3u8Url.split("token=")[1];
  }
  return { streamUrl: variantUrl || m3u8Url, headers };
}

async function probeDuration(file: string): Promise<number> {
  const out = await spawnDone("ffprobe", [
    "-v",
    "quiet",
    "-show_entries",
    "format=duration",
    "-of",
    "csv=p=0",
    file,
  ]);
  return Number(out.trim()) || 0;
}

async function assertRealVideo(file: string, expectedSec: number): Promise<void> {
  const fs = await import("fs");
  const size = fs.statSync(file).size;
  if (size < 4096)
    throw new Error(`${file.split("/").pop()} is empty (${size}B — segment fetches failed)`);
  const dur = await probeDuration(file);
  if (dur < expectedSec * 0.5)
    throw new Error(
      `${file.split("/").pop()} has ${dur.toFixed(2)}s vs ${expectedSec}s — no decodable frames`,
    );
}

type SentenceWindow = { text: string; start: number; end: number };
type AlignedWord = { sent: number; text: string; start: number; end: number };

async function alignSentences(
  wav: string,
  textFile: string,
  jobDir: string,
): Promise<{ sentences: SentenceWindow[]; words: AlignedWord[] }> {
  const path = (await import("path")).default;
  const fs = await import("fs");
  const candidates = [
    path.join(process.cwd(), "scripts", "explainer-align.py"),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../scripts", "explainer-align.py"),
  ];
  const alignScript = candidates.find((c) => fs.existsSync(c));
  if (!alignScript) throw new Error(`explainer-align.py not found in: ${candidates.join(", ")}`);
  const outFile = path.join(jobDir, "align.json");
  await spawnDone("/usr/local/bin/python3.11", [alignScript, wav, textFile, outFile]);
  return JSON.parse(fs.readFileSync(outFile, "utf8")) as {
    sentences: SentenceWindow[];
    words: AlignedWord[];
  };
}

type CaptionStyle = {
  fontFile: string;
  size: number;
  textColor: string;
  highlightColor: string;
  stroke: number;
  strokeColor: string;
  y: number;
};

async function buildCaptionTrack(
  words: AlignedWord[],
  jobDir: string,
  style: CaptionStyle,
  registerChild?: (proc: RenderChild) => void,
): Promise<string> {
  const path = (await import("path")).default;
  const fs = await import("fs");
  const chunks: AlignedWord[][] = [];
  let current: AlignedWord[] = [];
  for (const w of words) {
    if (current.length && (current.length >= 3 || current[0].sent !== w.sent)) {
      chunks.push(current);
      current = [];
    }
    current.push(w);
  }
  if (current.length) chunks.push(current);

  const states: { start: number; end: number; words: string[]; active: number; scale: number }[] = [];
  let t = 0;
  for (const chunk of chunks) {
    const chunkStart = chunk[0].start;
    const chunkEnd = chunk[chunk.length - 1].end;
    if (chunkStart > t) states.push({ start: t, end: chunkStart, words: [], active: -1, scale: 1 });
    const texts = chunk.map((w) => w.text);
    chunk.forEach((w, k) => {
      const end = k + 1 < chunk.length ? chunk[k + 1].start : chunkEnd;
      if (k === 0) {
        const POP = 0.05;
        const pops = [0.85, 0.94];
        let at = w.start;
        for (const scale of pops) {
          const stop = Math.min(end, at + POP);
          if (stop > at) states.push({ start: at, end: stop, words: texts, active: k, scale });
          at = stop;
        }
        if (end > at) states.push({ start: at, end, words: texts, active: k, scale: 1 });
        return;
      }
      states.push({ start: w.start, end, words: texts, active: k, scale: 1 });
    });
    t = chunkEnd;
  }
  const statesFile = path.join(jobDir, "caption_states.json");
  fs.writeFileSync(statesFile, JSON.stringify({ style, states }), "utf8");
  const capDir = path.join(jobDir, "captions");
  const scriptCandidates = [
    path.join(process.cwd(), "scripts", "explainer-captions.py"),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../scripts", "explainer-captions.py"),
  ];
  const capScript = scriptCandidates.find((c) => fs.existsSync(c));
  if (!capScript) throw new Error(`explainer-captions.py not found in: ${scriptCandidates.join(", ")}`);
  await spawnDone("/usr/local/bin/python3.11", [capScript, statesFile, capDir], registerChild);
  const movFile = path.join(jobDir, "captions.mov");
  await spawnDone(
    "ffmpeg",
    ["-y", "-f", "concat", "-safe", "0", "-i", path.join(capDir, "caps.txt"), "-vf", "fps=30", "-c:v", "qtrle", "-pix_fmt", "argb", movFile],
    registerChild,
  );
  return movFile;
}

function clipShares(
  clips: ExplainerClip[],
  windows: SentenceWindow[],
  voSec: number,
): { start: number; duration: number }[] {
  const groups: { from: number; to: number; idx: number[] }[] = [];
  clips.forEach((c, i) => {
    if (!c.sentences) throw new Error(`Clip ${c.start}s has no sentences range in the plan`);
    const [from, to] = c.sentences;
    if (from < 0 || to < from || to >= windows.length)
      throw new Error(`Clip ${c.start}s sentences ${from}-${to} out of range (script has ${windows.length})`);
    const last = groups[groups.length - 1];
    if (last && last.from === from && last.to === to) last.idx.push(i);
    else groups.push({ from, to, idx: [i] });
  });
  const shares: { start: number; duration: number }[] = new Array(clips.length);
  groups.forEach((g, gi) => {
    const groupStart = gi === 0 ? 0 : windows[g.from].start;
    const groupEnd =
      gi + 1 < groups.length ? windows[groups[gi + 1].from].start : voSec;
    const each = (groupEnd - groupStart) / g.idx.length;
    g.idx.forEach((clipIdx, k) => {
      shares[clipIdx] = { start: groupStart + k * each, duration: each };
    });
  });
  return shares;
}

export async function runRenderJob(
  opts: RenderOpts,
): Promise<{ path: string; voiceoverSec: number; videoSec: number }> {
  const path = (await import("path")).default;
  const os = (await import("os")).default;
  const fs = await import("fs");
  const status = (s: ExplainerStatus) => opts.onStatus?.(s);

  if (!opts.clips.length) throw new Error("No clips in plan");
  if (!opts.script.trim()) throw new Error("Empty voiceover script");

  const jobDir = path.join(os.tmpdir(), `explainer_${opts.jobKey}`);
  fs.mkdirSync(jobDir, { recursive: true });

  try {
    status({
      stage: "preparing",
      clipsDone: 0,
      clipsTotal: opts.clips.length,
      message: "Resolving stream variant",
    });
    const { streamUrl, headers } = await resolveStreamUrl(opts.m3u8Url);

    const textFile = path.join(jobDir, "script.txt");
    const wavFile = path.join(jobDir, "voiceover.wav");
    fs.writeFileSync(textFile, opts.script, "utf8");

    const scriptCandidates = [
      path.join(process.cwd(), "scripts", "explainer-tts.py"),
      path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        "../../scripts",
        "explainer-tts.py",
      ),
    ];
    const ttsScript = scriptCandidates.find((c) => fs.existsSync(c));
    if (!ttsScript)
      throw new Error(`explainer-tts.py not found in: ${scriptCandidates.join(", ")}`);

    const sliceFilter = buildSliceFilter(opts);
    status({
      stage: "voiceover",
      clipsDone: 0,
      clipsTotal: opts.clips.length,
      message: "Kokoro TTS synthesizing",
    });
    const ttsP = spawnDone(
      "/usr/local/bin/python3.11",
      [
        ttsScript,
        textFile,
        wavFile,
        opts.voice ?? "am_liam",
        String(Math.max(0.5, Math.min(2, opts.ttsSpeed ?? 1))),
      ],
      opts.registerChild,
    ).then(async (out) => {
      const lastLine = out.trim().split("\n").pop() ?? "";
      const parsed = JSON.parse(lastLine) as { duration: number };
      if (!parsed.duration) parsed.duration = await probeDuration(wavFile);
      return parsed;
    });

    const WINDOW_SEC = 30;
    const MAX_CLIP_SEC = 4.5;
    const sources = opts.clips.map((c) => ({ url: streamUrl, headers, seek: c.start }));
    const scanNotes: (string | undefined)[] = new Array(opts.clips.length).fill(undefined);
    const scanTargets = opts.enableScan
      ? opts.clips
          .map((c, i) => ({ c, i }))
          .filter((x) => x.c.needs_visual_scan && (x.c.visual_prompt ?? "").trim())
      : [];
    if (scanTargets.length) {
      const scanCandidates = [
        path.join(process.cwd(), "scripts", "siglip-scan.py"),
        path.resolve(
          path.dirname(new URL(import.meta.url).pathname),
          "../../scripts",
          "siglip-scan.py",
        ),
      ];
      const scanScript = scanCandidates.find((c) => fs.existsSync(c));
      if (!scanScript) throw new Error(`siglip-scan.py not found in: ${scanCandidates.join(", ")}`);
      status({
        stage: "scanning",
        clipsDone: 0,
        clipsTotal: scanTargets.length,
        message: `Fetching ${scanTargets.length} ±15s windows`,
      });
      const winFile = (i: number) => path.join(jobDir, `window_${String(i).padStart(3, "0")}.mp4`);
      const winStart = (c: ExplainerClip) => Math.max(0, c.start - 15);
      let fetched = 0;
      const fetchWindow = async ({ c, i }: { c: ExplainerClip; i: number }) => {
        const wargs = ["-y"];
        if (headers) wargs.push("-headers", headers);
        wargs.push(
          "-ss",
          String(winStart(c)),
          "-i",
          streamUrl,
          "-t",
          String(WINDOW_SEC),
          "-an",
          "-c:v",
          "copy",
          "-avoid_negative_ts",
          "make_zero",
          winFile(i),
        );
        await spawnDone("ffmpeg", wargs, opts.registerChild);
        fetched++;
        status({
          stage: "scanning",
          clipsDone: fetched,
          clipsTotal: scanTargets.length,
          message: `Window @${c.start}s`,
        });
      };
      for (let g = 0; g < scanTargets.length; g += 2) {
        await Promise.all(scanTargets.slice(g, g + 2).map(fetchWindow));
      }
      const manifest = scanTargets.map(({ c, i }) => ({
        id: i,
        window: winFile(i),
        offset: winStart(c),
        prompt: (c.visual_prompt ?? "").trim(),
      }));
      const manifestFile = path.join(jobDir, "scan_manifest.json");
      fs.writeFileSync(manifestFile, JSON.stringify(manifest), "utf8");
      status({
        stage: "scanning",
        clipsDone: scanTargets.length,
        clipsTotal: scanTargets.length,
        message: "SigLIP scanning windows...",
      });
      const scanOut = await spawnDone(
        "/usr/local/bin/python3.11",
        [scanScript, manifestFile],
        opts.registerChild,
      );
      for (const line of scanOut.trim().split("\n")) {
        let r: { id: number; best_sec: number | null; score: number; flat: boolean };
        try {
          r = JSON.parse(line);
        } catch {
          continue;
        }
        const c = opts.clips[r.id];
        if (!c || r.best_sec == null) continue;
        const ws = winStart(c);
        if (!r.flat && r.score >= 0.15) {
          const rel = Math.max(0, Math.min(WINDOW_SEC - MAX_CLIP_SEC - 0.1, r.best_sec - ws));
          sources[r.id] = { url: winFile(r.id), headers: "", seek: rel };
          const shift = ws + rel - c.start;
          scanNotes[r.id] = `shift ${shift >= 0 ? "+" : ""}${shift.toFixed(1)}s conf ${r.score}`;
        } else {
          scanNotes[r.id] = `scan rejected (${r.flat ? "flat scores" : `low conf ${r.score}`})`;
        }
      }
    }

    let clipsDone = 0;
    const sliceClip = async (clip: ExplainerClip, i: number): Promise<string> => {
      const outFile = path.join(jobDir, `clip_${String(i).padStart(3, "0")}.mp4`);
      const src = sources[i];
      const share = shares[i].duration;
      const sliceArgs = (seek: number) => {
        const args = ["-y"];
        if (src.headers) args.push("-headers", src.headers);
        args.push(
          "-ss",
          String(seek),
          "-i",
          src.url,
          "-t",
          (share + (i === opts.clips.length - 1 ? 2.5 : 0.6)).toFixed(3),
          "-an",
          "-filter_complex",
          sliceFilter,
          "-map",
          "[v]",
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "22",
          outFile,
        );
        return args;
      };
      // A bad stream segment fails the same seek every time, so later
      // attempts nudge forward a little while staying in the same shot.
      const nudges = [0, 1, 2.5];
      for (let attempt = 1; ; attempt++) {
        try {
          await spawnDone("ffmpeg", sliceArgs(src.seek + nudges[attempt - 1]), opts.registerChild);
          await assertRealVideo(outFile, share);
          break;
        } catch (e) {
          if (attempt >= nudges.length) throw e;
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
      }
      clipsDone++;
      status({
        stage: "slicing",
        clipsDone,
        clipsTotal: opts.clips.length,
        message: `Slice ${clip.start}s${scanNotes[i] ? ` (${scanNotes[i]})` : ""}`,
      });
      return outFile;
    };

    const vo = await ttsP;
    const { sentences: windows, words: alignedWords } = await alignSentences(wavFile, textFile, jobDir);
    const shares = clipShares(opts.clips, windows, vo.duration);
    const queue = opts.clips.map((c, i) => ({ c, i }));
    const clipFiles: string[] = new Array(opts.clips.length);
    const poolSize = 3;
    let cursor = 0;
    const worker = async () => {
      while (cursor < queue.length) {
        const item = queue[cursor++];
        clipFiles[item.i] = await sliceClip(item.c, item.i);
      }
    };

    status({
      stage: "slicing",
      clipsDone: 0,
      clipsTotal: opts.clips.length,
      message: `Pulling ${opts.clips.length} micro-cuts`,
    });
    const sliceP = Promise.all(
      Array.from({ length: Math.min(poolSize, queue.length) }, worker),
    ).then(() => clipFiles);
    const files = await sliceP;
    for (let i = 0; i < files.length; i++) {
      const target = shares[i].duration;
      const actual = await probeDuration(files[i]);
      if (actual > target + 0.02) {
        const trimmed = path.join(jobDir, `clip_fit_${String(i).padStart(3, "0")}.mp4`);
        await spawnDone(
          "ffmpeg",
          ["-y", "-i", files[i], "-t", target.toFixed(3), "-an", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "22", trimmed],
          opts.registerChild,
        );
        files[i] = trimmed;
      }
    }

    status({
      stage: "assembling",
      clipsDone: files.length,
      clipsTotal: files.length,
      message: "Syncing clips to voiceover",
    });
    const videoTotal = (await Promise.all(files.map(probeDuration))).reduce((a, b) => a + b, 0);
    const tailPad = vo.duration - videoTotal;
    if (tailPad > 0.05) {
      const padded = path.join(jobDir, "clip_tail.mp4");
      await spawnDone(
        "ffmpeg",
        [
          "-y",
          "-i",
          files[files.length - 1],
          "-an",
          "-vf",
          `tpad=stop_mode=clone:stop_duration=${tailPad.toFixed(3)}`,
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-crf",
          "22",
          padded,
        ],
        opts.registerChild,
      );
      files[files.length - 1] = padded;
    }

    const listFile = path.join(jobDir, "concat.txt");
    fs.writeFileSync(
      listFile,
      files.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join("\n"),
      "utf8",
    );

    const dir = opts.outputDir || path.join(os.homedir(), "Desktop");
    fs.mkdirSync(dir, { recursive: true });
    const safeTitle =
      opts.title
        .replace(/[/\\:]/g, "")
        .replace(/\s+/g, " ")
        .trim() || "explainer";
    let outPath = path.join(dir, `${safeTitle}.mp4`);
    let n = 2;
    while (fs.existsSync(outPath) && n < 100) {
      outPath = path.join(dir, `${safeTitle} (${n}).mp4`);
      n++;
    }

    const drawFilter = (await buildDrawText(opts, jobDir)).slice(1);
    const lookFilter = LOOK_PRESETS[opts.look ?? "none"] ?? "";
    const fxChain = [lookFilter, drawFilter].filter(Boolean).join(",");
    const captionMov = opts.captions
      ? await buildCaptionTrack(
          alignedWords,
          jobDir,
          {
            fontFile: FONT_MAP[opts.captionFont ?? "Arial"]?.bold ?? "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            size: opts.captionSize ?? 64,
            textColor: opts.captionTextColor ?? "#FFFFFF",
            highlightColor: opts.captionColor ?? "#FFD400",
            stroke: opts.captionStroke ?? 5,
            strokeColor: opts.captionStrokeColor ?? "#000000",
            y: opts.captionY ?? 62,
          },
          opts.registerChild,
        )
      : null;
    const useText = fxChain.length > 0 || captionMov !== null;
    const baseChain = fxChain.length > 0 ? `[0:v]${fxChain}[base]` : "[0:v]null[base]";
    const assembleArgs = useText
      ? [
          "-y",
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          listFile,
          "-i",
          wavFile,
          ...(captionMov ? ["-i", captionMov] : []),
          "-filter_complex",
          captionMov
            ? `${baseChain};[base][2:v]overlay=0:0:format=auto[vout]`
            : `${baseChain.replace("[base]", "[vout]")}`,
          "-map",
          "[vout]",
          "-map",
          "1:a",
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "21",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          "-movflags",
          "+faststart",
        ]
      : [
          "-y",
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          listFile,
          "-i",
          wavFile,
          "-map",
          "0:v",
          "-map",
          "1:a",
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          "-movflags",
          "+faststart",
        ];
    assembleArgs.push("-t", vo.duration.toFixed(3));
    assembleArgs.push(outPath);
    await spawnDone("ffmpeg", assembleArgs, opts.registerChild);
    for (let i = 0; i < 50; i++) {
      try {
        fs.unlinkSync(path.join(jobDir, `drawtext_${i}.txt`));
      } catch {
        break;
      }
    }

    const videoSec = await probeDuration(outPath);
    fs.promises.rm(jobDir, { recursive: true, force: true });
    if (Math.abs(videoSec - vo.duration) > 0.15)
      throw new Error(
        `Video ${videoSec.toFixed(2)}s does not match voiceover ${vo.duration.toFixed(2)}s`,
      );
    status({ stage: "done", clipsDone: files.length, clipsTotal: files.length, message: outPath });
    return { path: outPath, voiceoverSec: vo.duration, videoSec };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    status({
      stage: "error",
      clipsDone: 0,
      clipsTotal: opts.clips.length,
      message: `${msg} (partial files kept in ${jobDir})`,
    });
    throw new Error(msg);
  }
}
