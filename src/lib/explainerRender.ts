export type ExplainerClip = { start: number; duration: number; quote?: string };
export type ExplainerStatus = {
  stage: "preparing" | "slicing" | "voiceover" | "assembling" | "done" | "error";
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

    let clipsDone = 0;
    const sliceClip = async (clip: ExplainerClip, i: number): Promise<string> => {
      const outFile = path.join(jobDir, `clip_${String(i).padStart(3, "0")}.mp4`);
      const args = ["-y"];
      if (headers) args.push("-headers", headers);
      args.push(
        "-ss",
        String(clip.start),
        "-i",
        streamUrl,
        "-t",
        String(clip.duration),
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
      for (let attempt = 1; ; attempt++) {
        try {
          await spawnDone("ffmpeg", args, opts.registerChild);
          await assertRealVideo(outFile, clip.duration);
          break;
        } catch (e) {
          if (attempt >= 3) throw e;
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
      }
      clipsDone++;
      status({
        stage: "slicing",
        clipsDone,
        clipsTotal: opts.clips.length,
        message: `Slice ${clip.start}s × ${clip.duration}s`,
      });
      return outFile;
    };

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
    const [vo, files] = await Promise.all([ttsP, sliceP]);

    status({
      stage: "assembling",
      clipsDone: files.length,
      clipsTotal: files.length,
      message: "Syncing clips to voiceover",
    });
    const planTotal = opts.clips.reduce((a, c) => a + c.duration, 0);
    const delta = vo.duration - planTotal;
    if (delta > 0.2) {
      if (vo.duration > planTotal * 1.6)
        throw new Error(
          `Voiceover ${vo.duration.toFixed(1)}s is far longer than clip plan ${planTotal.toFixed(1)}s — needs more cuts`,
        );
      const clips = files;
      const pad = delta / clips.length;
      const padded: string[] = [];
      for (let i = 0; i < clips.length; i++) {
        const out = path.join(jobDir, `clip_pad_${String(i).padStart(3, "0")}.mp4`);
        await spawnDone(
          "ffmpeg",
          [
            "-y",
            "-i",
            clips[i],
            "-an",
            "-vf",
            `tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)}`,
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-crf",
            "22",
            out,
          ],
          opts.registerChild,
        );
        padded.push(out);
      }
      files.length = 0;
      files.push(...padded);
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
    const useText = drawFilter.length > 0;
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
          "-filter_complex",
          `[0:v]${drawFilter}[vout]`,
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
    if (planTotal + (delta > 0.2 ? delta : 0) > vo.duration + 0.05) {
      assembleArgs.push("-t", vo.duration.toFixed(3));
    }
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
