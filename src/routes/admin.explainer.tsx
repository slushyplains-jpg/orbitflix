import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { runRenderJob, type ExplainerClip, type ExplainerStatus } from "@/lib/explainerRender";
import {
  diagnoseSheet,
  parseAllRows,
  parseProductionRow,
  type ParsedRow,
} from "@/lib/explainerRow";

export const Route = createFileRoute("/admin/explainer")({
  component: ExplainerPage,
});

const TMDB_KEY = "dddf373a16513b75dbbed7847f542f95";

type SaveResult = {
  path: string;
  title: string;
  year: string;
  entries: number;
  source: string;
  size: number;
};

const saveSubtitlesForMovie = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { tmdbId: number; lang?: string; outputDir?: string } }) => {
    const { default: path } = await import("path");
    const { default: os } = await import("os");
    const { writeFileSync, existsSync, statSync } = await import("fs");
    const { gunzipSync } = await import("zlib");
    const { tmdbId, lang = "eng", outputDir } = data;

    const movieRes = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`,
    );
    if (!movieRes.ok)
      throw new Error(`TMDB lookup failed (${movieRes.status}) — is ${tmdbId} a valid movie ID?`);
    const movie = (await movieRes.json()) as any;
    const title: string = movie.title ?? "";
    const year: string = (movie.release_date ?? "").slice(0, 4);
    if (!title) throw new Error("TMDB returned no title for this ID");

    const metaRes = await fetch(`https://data.vidsrc.sh/api.php?type=movie&tmdb=${tmdbId}`, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://stellarconductornexus.com/" },
    });
    const metaJson = (await metaRes.json()) as any;
    const imdbId = String(metaJson?.data?.imdb_id ?? "").replace(/^tt/i, "");
    if (!imdbId) throw new Error(`Could not find IMDB ID for TMDB ${tmdbId}`);

    const searchUrl = `https://rest.opensubtitles.org/search/imdbid-${imdbId}/sublanguageid-${lang}`;
    const searchRes = await fetch(searchUrl, {
      headers: { "X-User-Agent": "trailers.to-UA", "User-Agent": "Mozilla/5.0" },
    });
    const results: any[] = await searchRes.json();
    if (!results?.length)
      throw new Error(`No ${lang} subtitles found for "${title}" (imdb tt${imdbId})`);

    const best = results.sort((a, b) => Number(b.SubDownloadsCnt) - Number(a.SubDownloadsCnt))[0];
    const downloadLink: string = best.SubDownloadLink;
    if (!downloadLink) throw new Error("No download link in subtitle result");

    const gzRes = await fetch(downloadLink, {
      headers: { "User-Agent": "Mozilla/5.0", "X-User-Agent": "trailers.to-UA" },
    });
    if (!gzRes.ok) throw new Error(`Failed to download subtitle: ${gzRes.status}`);
    const gzBuf = Buffer.from(await gzRes.arrayBuffer());
    const srtText = gunzipSync(gzBuf).toString("utf8");

    const entries = (srtText.match(/-->/g) ?? []).length;
    if (!entries) throw new Error("Downloaded file contains no subtitle entries");

    const dir = outputDir || path.join(os.homedir(), "Desktop");
    const safeTitle = `${title}${year ? ` (${year})` : ""}`
      .replace(/[/\\:]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    let outPath = path.join(dir, `${safeTitle}.srt`);
    let n = 2;
    while (existsSync(outPath) && n < 100) {
      outPath = path.join(dir, `${safeTitle} (${n}).srt`);
      n++;
    }
    writeFileSync(outPath, srtText, "utf8");
    const size = statSync(outPath).size;

    return { path: outPath, title, year, entries, source: best.SubFileName ?? "subtitles", size };
  },
);

const pickFolder = createServerFn({ method: "GET" }).handler(async () => {
  const { execFile } = await import("child_process");
  const script = `tell application "Finder" to set f to choose folder with prompt "Select output folder"\nreturn POSIX path of f`;
  return new Promise<{ path: string }>((resolve, reject) => {
    execFile("osascript", ["-e", script], (err, stdout) => {
      if (err) reject(new Error("Folder picker cancelled"));
      else resolve({ path: stdout.trim() });
    });
  });
});

type Killable = { kill: () => void; on?: (event: "close", cb: () => void) => void };
type RenderResult = { path: string; voiceoverSec: number; videoSec: number };
type JobState = { status: ExplainerStatus; result?: RenderResult; error?: string };

const jobs: Record<string, JobState> = {};
const jobChildren: Record<string, Set<Killable>> = {};

const renderExplainer = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      jobKey: string;
      m3u8Url: string;
      script: string;
      clips: ExplainerClip[];
      title: string;
      outputDir?: string;
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
    };
  }) => {
    jobs[data.jobKey] = {
      status: {
        stage: "preparing",
        clipsDone: 0,
        clipsTotal: data.clips.length,
        message: "queued",
      },
    };
    const kids = new Set<Killable>();
    jobChildren[data.jobKey] = kids;
    runRenderJob({
      m3u8Url: data.m3u8Url,
      script: data.script,
      clips: data.clips,
      title: data.title,
      outputDir: data.outputDir ?? "",
      voice: data.voice,
      ttsSpeed: data.ttsSpeed,
      zoom: data.zoom,
      bg: data.bg,
      blurIntensity: data.blurIntensity,
      overlayText: data.overlayText,
      textSize: data.textSize,
      textColor: data.textColor,
      textX: data.textX,
      textY: data.textY,
      fontFamily: data.fontFamily,
      fontStyle: data.fontStyle,
      jobKey: data.jobKey,
      onStatus: (s) => {
        if (jobs[data.jobKey]) jobs[data.jobKey] = { ...jobs[data.jobKey], status: s };
      },
      registerChild: (p) => {
        kids.add(p);
        p.on?.("close", () => kids.delete(p));
      },
    })
      .then((r) => {
        if (jobs[data.jobKey])
          jobs[data.jobKey] = {
            ...jobs[data.jobKey],
            status: { ...jobs[data.jobKey].status, stage: "done", message: r.path },
            result: r,
          };
      })
      .catch((e: Error) => {
        if (jobs[data.jobKey])
          jobs[data.jobKey] = {
            ...jobs[data.jobKey],
            status: { ...jobs[data.jobKey].status, stage: "error", message: "failed" },
            error: e?.message ?? String(e),
          };
      });
    return { started: true };
  },
);

const getRenderStatus = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { jobKey: string } }): Promise<JobState> =>
    jobs[data.jobKey] ?? {
      status: { stage: "preparing", clipsDone: 0, clipsTotal: 0, message: "waiting" },
    },
);

const cancelRender = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { jobKey: string } }) => {
    for (const p of jobChildren[data.jobKey] ?? []) {
      try {
        p.kill();
      } catch {
        /* already dead */
      }
    }
    jobChildren[data.jobKey]?.clear();
    if (jobs[data.jobKey])
      jobs[data.jobKey] = {
        ...jobs[data.jobKey],
        status: { ...jobs[data.jobKey].status, stage: "error", message: "cancelled" },
        error: "Cancelled",
      };
    return { ok: true };
  },
);

type Snapshot = {
  m3u8Url: string;
  script: string;
  clips: ExplainerClip[];
  title: string;
  outputDir?: string;
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
};

const fetchSheetCsv = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { url: string } }) => {
    let url = data.url.trim();
    if (!/^https?:\/\//i.test(url)) throw new Error("Enter a full https:// URL");
    const g = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (g && !/export|csv|gviz/i.test(url)) {
      const gid = url.match(/[#&?]gid=(\d+)/)?.[1] ?? "0";
      url = `https://docs.google.com/spreadsheets/d/${g[1]}/export?format=csv&gid=${gid}`;
    }
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "text/csv,*/*" },
      redirect: "follow",
    });
    if (!res.ok)
      throw new Error(
        `Sheet fetch failed (${res.status}) — is it shared as "Anyone with the link"?`,
      );
    const text = await res.text();
    if (text.length < 20 || /^\s*</.test(text))
      throw new Error("Response doesn't look like CSV — check the URL and sharing settings");
    return { text, resolvedUrl: url };
  },
);

const TEMPLATE_DIR = `${process.env.HOME}/Desktop/explainer-templates`;

const saveTemplate = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { name: string; settings: Record<string, unknown> } }) => {
    const { mkdirSync, writeFileSync } = await import("fs");
    const { default: path } = await import("path");
    mkdirSync(TEMPLATE_DIR, { recursive: true });
    const safe = data.name.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "template";
    writeFileSync(
      path.join(TEMPLATE_DIR, `${safe}.json`),
      JSON.stringify(data.settings, null, 2),
      "utf8",
    );
    return { name: safe };
  },
);

const listTemplates = createServerFn({ method: "GET" }).handler(async () => {
  const { readdirSync, mkdirSync } = await import("fs");
  const { default: path } = await import("path");
  mkdirSync(TEMPLATE_DIR, { recursive: true });
  return {
    templates: readdirSync(TEMPLATE_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", "")),
  };
});

const loadTemplate = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { name: string } }) => {
    const { readFileSync } = await import("fs");
    const { default: path } = await import("path");
    return {
      settings: JSON.parse(
        readFileSync(path.join(TEMPLATE_DIR, `${data.name}.json`), "utf8"),
      ) as Record<string, unknown>,
    };
  },
);

type Saved = SaveResult & { id: string };

type RenderJob = {
  id: string;
  jobKey: string;
  title: string;
  stage: string;
  clipsDone: number;
  clipsTotal: number;
  message: string;
  jobStatus: "queued" | "running" | "done" | "error";
  elapsed: number;
  outPath?: string;
  error?: string;
  params: Snapshot;
};

const STAGE_ICON: Record<string, string> = {
  queued: "⏱",
  preparing: "🔍",
  voiceover: "🎙",
  slicing: "✂️",
  assembling: "🧩",
  done: "✅",
  error: "❌",
};

const VOICES = [
  { id: "am_liam", label: "Liam — male, warm" },
  { id: "am_adam", label: "Adam — male, deep" },
  { id: "am_michael", label: "Michael — male, crisp" },
  { id: "af_heart", label: "Heart — female, soft" },
  { id: "af_bella", label: "Bella — female, bright" },
  { id: "af_nicole", label: "Nicole — female, whispery" },
  { id: "bf_emma", label: "Emma — female, British" },
  { id: "bm_george", label: "George — male, British" },
];

function ExplainerPage() {
  const [tmdbId, setTmdbId] = useState("");
  const [outputDir, setOutputDir] = useState("");
  const [status, setStatus] = useState<"idle" | "fetching" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Saved[]>([]);
  const [rowText, setRowText] = useState("");
  const [parsed, setParsed] = useState<ParsedRow | null>(null);
  const [rowError, setRowError] = useState("");
  const [m3u8Url, setM3u8Url] = useState("");
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);
  const [voice, setVoice] = useState("am_liam");
  const [ttsSpeed, setTtsSpeed] = useState(0.85);
  const [zoom, setZoom] = useState("2");
  const [bg, setBg] = useState<"blur" | "black">("blur");
  const [blurIntensity, setBlurIntensity] = useState(20);
  const [overlayText, setOverlayText] = useState("");
  const [textSize, setTextSize] = useState(64);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(85);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontStyle, setFontStyle] = useState<"regular" | "bold" | "italic" | "bolditalic">("bold");
  const pollsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheetRows, setSheetRows] = useState<ParsedRow[]>([]);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateMsg, setTemplateMsg] = useState("");
  const [queueMsg, setQueueMsg] = useState("");
  const jobsRef = useRef<RenderJob[]>([]);
  const runningIdRef = useRef<string | null>(null);

  useEffect(() => {
    listTemplates()
      .then((r) => setTemplates(r.templates))
      .catch(() => {});
    const saved = localStorage.getItem("explainer.sheetUrl");
    if (saved) {
      setSheetUrl(saved);
      handleLoadSheet(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sheetUrl.trim()) localStorage.setItem("explainer.sheetUrl", sheetUrl);
  }, [sheetUrl]);

  useEffect(() => {
    return () => {
      Object.values(pollsRef.current).forEach(clearInterval);
    };
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrappedTextRef = useRef("");

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => drawText();
    img.src = "/preview.jpg";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (!overlayText.trim()) {
      wrappedTextRef.current = "";
      return;
    }
    const fontSize = Math.round(textSize * (W / 1080));
    const isBold = fontStyle === "bold" || fontStyle === "bolditalic";
    const isItalic = fontStyle === "italic" || fontStyle === "bolditalic";
    ctx.font = `${isItalic ? "italic " : ""}${isBold ? "bold " : ""}${fontSize}px "${fontFamily}", sans-serif`;
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = textColor;
    const x = (textX / 100) * W;
    const maxPx = (W / 1080) * 1020;
    const lines: string[] = [];
    for (const para of overlayText.split("\n")) {
      const words = para.split(" ");
      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxPx && line) {
          lines.push(line);
          line = word;
        } else line = test;
      }
      if (line) lines.push(line);
    }
    wrappedTextRef.current = lines.join("\n");
    const lineH = fontSize * 1.2;
    const totalH = lines.length * lineH;
    const baseY = (textY / 100) * H - totalH / 2 + fontSize / 2;
    lines.forEach((ln, i) => ctx.fillText(ln, x, baseY + i * lineH));
  }, [overlayText, textSize, textColor, textX, textY, fontFamily, fontStyle]);

  useEffect(() => {
    drawText();
  }, [drawText]);

  function updateRenderJob(id: string, patch: Partial<RenderJob>) {
    jobsRef.current = jobsRef.current.map((j) => (j.id === id ? { ...j, ...patch } : j));
    setRenderJobs(jobsRef.current);
  }

  function handleParse() {
    try {
      setParsed(parseProductionRow(rowText));
      setRowError("");
    } catch (err) {
      setParsed(null);
      setRowError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleFilePicked(file?: File) {
    if (!file) return;
    setRowError("");
    try {
      const text = await file.text();
      const rows = parseAllRows(text);
      if (!rows.length)
        throw new Error(`No To-do rows with a valid clip-plan JSON found in "${file.name}"`);
      setSheetRows(rows);
      if (rows.length === 1) setParsed(rows[0]);
    } catch (err) {
      setRowError(err instanceof Error ? err.message : String(err));
    }
  }

  function selectSheetRow(row: ParsedRow) {
    setParsed(row);
  }

  function currentSnapshot(row: ParsedRow): Snapshot {
    return {
      m3u8Url: m3u8Url.trim(),
      script: row.script,
      clips: row.clips,
      title: row.title,
      outputDir: outputDir.trim() || undefined,
      voice,
      ttsSpeed,
      zoom: Number(zoom),
      bg,
      blurIntensity,
      overlayText: wrappedTextRef.current || overlayText,
      textSize,
      textColor,
      textX,
      textY,
      fontFamily,
      fontStyle,
    };
  }

  function startJob(job: RenderJob) {
    updateRenderJob(job.id, {
      jobStatus: "running",
      stage: "queued",
      message: "starting",
      elapsed: 0,
    });
    const start = Date.now();
    renderExplainer({ data: { jobKey: job.jobKey, ...job.params } }).catch((err) => {
      updateRenderJob(job.id, {
        jobStatus: "error",
        error: err instanceof Error ? err.message : "Failed to start job",
      });
      runningIdRef.current = null;
      ensureRunning();
    });
    pollsRef.current[job.id] = setInterval(async () => {
      try {
        const st0 = await getRenderStatus({ data: { jobKey: job.jobKey } });
        const st = st0.status;
        updateRenderJob(job.id, {
          stage: st.stage,
          clipsDone: st.clipsDone,
          clipsTotal: st.clipsTotal,
          message: st.message,
          elapsed: Math.floor((Date.now() - start) / 1000),
          outPath: st0.result?.path,
          error: st0.error,
          jobStatus: st.stage === "done" || st.stage === "error" ? st.stage : "running",
        });
        if (st.stage === "done" || st.stage === "error") {
          clearInterval(pollsRef.current[job.id]);
          delete pollsRef.current[job.id];
          runningIdRef.current = null;
          ensureRunning();
        }
      } catch {
        clearInterval(pollsRef.current[job.id]);
        delete pollsRef.current[job.id];
        updateRenderJob(job.id, { jobStatus: "error", error: "Lost contact with render job" });
        runningIdRef.current = null;
        ensureRunning();
      }
    }, 1500);
  }

  function ensureRunning() {
    if (runningIdRef.current) return;
    const queued = jobsRef.current.filter((j) => j.jobStatus === "queued");
    if (!queued.length) return;
    const next = queued[queued.length - 1];
    runningIdRef.current = next.id;
    startJob(next);
  }

  function enqueueRow(row: ParsedRow, clearUrl = true) {
    if (!m3u8Url.trim()) {
      setRowError("Paste the M3U8 URL before queueing a row");
      return;
    }
    setRowError("");
    const jobKey = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const job: RenderJob = {
      id: `r_${jobKey}`,
      jobKey,
      title: row.title,
      stage: "queued",
      clipsDone: 0,
      clipsTotal: row.clips.length,
      message: "in queue",
      jobStatus: "queued",
      elapsed: 0,
      params: currentSnapshot(row),
    };
    jobsRef.current = [job, ...jobsRef.current];
    setRenderJobs(jobsRef.current);
    ensureRunning();
    if (clearUrl) {
      setM3u8Url("");
      setQueueMsg(`✅ Queued "${row.title}" — paste the next M3U8`);
      setTimeout(() => setQueueMsg(""), 4000);
    }
  }

  function handleRender() {
    if (parsed) enqueueRow(parsed);
  }

  function removeJob(id: string) {
    jobsRef.current = jobsRef.current.filter((j) => j.id !== id);
    setRenderJobs(jobsRef.current);
  }

  function clearFinished() {
    jobsRef.current = jobsRef.current.filter(
      (j) => j.jobStatus === "running" || j.jobStatus === "queued",
    );
    setRenderJobs(jobsRef.current);
  }

  async function handleCancelRender(job: RenderJob) {
    await cancelRender({ data: { jobKey: job.jobKey } });
    if (pollsRef.current[job.id]) {
      clearInterval(pollsRef.current[job.id]);
      delete pollsRef.current[job.id];
    }
    updateRenderJob(job.id, { jobStatus: "error", error: "Cancelled" });
    runningIdRef.current = null;
    ensureRunning();
  }

  async function handleLoadSheet(urlArg?: string) {
    const target = (typeof urlArg === "string" ? urlArg : sheetUrl).trim();
    if (!target) return;
    setSheetLoading(true);
    setRowError("");
    try {
      const res = await fetchSheetCsv({ data: { url: target } });
      const rows = parseAllRows(res.text);
      setSheetRows(rows);
      if (!rows.length) {
        const d = diagnoseSheet(res.text);
        if (!d.headerFound)
          setRowError(
            "Loaded the sheet, but its first row isn't a recognizable header (needs columns like …Script… and …Clip Timestamp Plan (JSON)…). Wrong tab?",
          );
        else
          setRowError(
            `Sheet OK (clip column: "${d.clipsHeader}"${d.progressHeader ? `, progress column: "${d.progressHeader}"` : ", NO Progress column found"}): ${d.totalDataRows} data rows → ${d.validClipRows} with valid clip JSON → ${d.todoRows} marked To-do. Progress values seen: ${
              d.progressValues
                .slice(0, 6)
                .map((x) => `"${x || "(empty)"}"`)
                .join(", ") || "none"
            }`,
          );
      } else if (rows.length === 1) setParsed(rows[0]);
    } catch (err) {
      setRowError(err instanceof Error ? err.message : String(err));
    } finally {
      setSheetLoading(false);
    }
  }

  function templateSettings() {
    return {
      voice,
      ttsSpeed,
      zoom,
      bg,
      blurIntensity,
      overlayText,
      textSize,
      textColor,
      textX,
      textY,
      fontFamily,
      fontStyle,
      outputDir,
      sheetUrl,
    };
  }

  async function handleSaveTemplate() {
    const name = templateName.trim();
    if (!name) return;
    try {
      await saveTemplate({ data: { name, settings: templateSettings() } });
      const r = await listTemplates();
      setTemplates(r.templates);
      setTemplateMsg(`✅ Saved "${name}"`);
      setTimeout(() => setTemplateMsg(""), 2500);
    } catch {
      setTemplateMsg("❌ Save failed");
    }
  }

  async function handleLoadTemplate() {
    if (!selectedTemplate) return;
    try {
      const { settings: t } = await loadTemplate({ data: { name: selectedTemplate } });
      if (typeof t.voice === "string") setVoice(t.voice);
      if (typeof t.ttsSpeed === "number") setTtsSpeed(t.ttsSpeed);
      if (t.zoom !== undefined) setZoom(String(t.zoom));
      if (t.bg === "blur" || t.bg === "black") setBg(t.bg);
      if (typeof t.blurIntensity === "number") setBlurIntensity(t.blurIntensity);
      if (typeof t.overlayText === "string") setOverlayText(t.overlayText);
      if (typeof t.textSize === "number") setTextSize(t.textSize);
      if (typeof t.textColor === "string") setTextColor(t.textColor);
      if (typeof t.textX === "number") setTextX(t.textX);
      if (typeof t.textY === "number") setTextY(t.textY);
      if (typeof t.fontFamily === "string") setFontFamily(t.fontFamily);
      if (
        t.fontStyle === "regular" ||
        t.fontStyle === "bold" ||
        t.fontStyle === "italic" ||
        t.fontStyle === "bolditalic"
      )
        setFontStyle(t.fontStyle);
      if (typeof t.outputDir === "string") setOutputDir(t.outputDir);
      if (typeof t.sheetUrl === "string") {
        setSheetUrl(t.sheetUrl);
        if (t.sheetUrl.trim()) handleLoadSheet(t.sheetUrl.trim());
      }
      setTemplateMsg(`✅ Loaded "${selectedTemplate}"`);
      setTimeout(() => setTemplateMsg(""), 2500);
    } catch {
      setTemplateMsg("❌ Load failed");
    }
  }

  async function handleFetch() {
    const id = Number(tmdbId);
    if (!id) return;
    setStatus("fetching");
    setError("");
    try {
      const res = await saveSubtitlesForMovie({
        data: { tmdbId: id, outputDir: outputDir.trim() || undefined },
      });
      setSaved((s) => [{ ...res, id: `s_${Date.now()}` }, ...s]);
      setStatus("done");
    } catch (err: any) {
      setStatus("error");
      setError(err.message ?? "Failed to fetch subtitles");
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem",
    borderRadius: "4px",
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    fontSize: "0.95rem",
    width: "100%",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    color: "#aaa",
    fontSize: "0.8rem",
    marginBottom: "4px",
    display: "block",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem",
        gap: "2rem",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          padding: "2rem",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "560px",
        }}
      >
        <h2 style={{ color: "#fff", margin: "0 0 0.5rem", fontSize: "1.3rem" }}>
          🎙 Explainer Studio
        </h2>
        <p style={{ color: "#666", fontSize: "0.8rem", margin: "0 0 1.5rem" }}>
          Step 1 — save the full-movie .srt by TMDB ID · Step 2 — paste a production row + m3u8 and
          render the short (parallel cut slices + Kokoro voiceover).
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>TMDB Movie ID</label>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                type="number"
                placeholder="e.g. 238"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFetch();
                }}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleFetch}
                disabled={status === "fetching" || !tmdbId.trim()}
                style={{
                  padding: "0.6rem 1rem",
                  background: status === "fetching" ? "#333" : "#e50914",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "0.9rem",
                  cursor: status === "fetching" || !tmdbId.trim() ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {status === "fetching" ? "Fetching..." : "📥 Fetch & Save SRT"}
              </button>
            </div>
            <span style={{ color: "#555", fontSize: "0.72rem" }}>
              {
                "TMDB → IMDb ID (vidsrc) → OpenSubtitles (most downloaded eng) → saved as Title (Year).srt"
              }
            </span>
          </div>

          <div>
            <label style={labelStyle}>Output directory</label>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span
                style={{
                  flex: 1,
                  color: outputDir ? "#fff" : "#555",
                  fontSize: "0.85rem",
                  padding: "0.6rem",
                  background: "#111",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {outputDir || "~/Desktop (default)"}
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const r = await pickFolder();
                    setOutputDir(r.path);
                  } catch {}
                }}
                style={{
                  padding: "0.6rem 1rem",
                  background: "#334155",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                📁 Browse
              </button>
              {outputDir && (
                <button
                  type="button"
                  onClick={() => setOutputDir("")}
                  style={{
                    padding: "0.6rem 0.5rem",
                    background: "transparent",
                    border: "1px solid #333",
                    borderRadius: "4px",
                    color: "#555",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {status === "error" && (
            <div
              style={{
                background: "#2a0a0a",
                border: "1px solid #4a1a1a",
                borderRadius: "6px",
                padding: "0.75rem",
              }}
            >
              <span style={{ color: "#f55", fontSize: "0.8rem", wordBreak: "break-all" }}>
                ❌ {error}
              </span>
            </div>
          )}
          {status === "done" && saved.length > 0 && (
            <span style={{ color: "#0f0", fontSize: "0.8rem" }}>
              ✅ Saved "{saved[0].path.split("/").pop()}" to Desktop folder
            </span>
          )}
        </div>

        <div style={{ borderTop: "1px solid #222", margin: "1.5rem 0 1.5rem" }} />

        <div
          style={{
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: "6px",
            padding: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <label
            style={{ color: "#fff", fontSize: "0.85rem", marginBottom: "0.5rem", display: "block" }}
          >
            Templates
          </label>
          <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              style={{
                padding: "0.6rem",
                borderRadius: "4px",
                border: "1px solid #333",
                background: "#0a0a0a",
                color: "#fff",
                fontSize: "0.95rem",
                flex: 1,
                boxSizing: "border-box" as const,
              }}
            />
            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={!templateName.trim()}
              style={{
                padding: "0.6rem 1rem",
                background: "#334155",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "0.85rem",
                cursor: templateName.trim() ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              💾 Save
            </button>
          </div>
          {templates.length > 0 && (
            <div style={{ display: "flex", gap: "6px" }}>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={{
                  padding: "0.6rem",
                  borderRadius: "4px",
                  border: "1px solid #333",
                  background: "#0a0a0a",
                  color: "#fff",
                  fontSize: "0.95rem",
                  flex: 1,
                  cursor: "pointer",
                  boxSizing: "border-box" as const,
                }}
              >
                <option value="">— load template —</option>
                {templates.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleLoadTemplate}
                disabled={!selectedTemplate}
                style={{
                  padding: "0.6rem 1rem",
                  background: selectedTemplate ? "#334155" : "#1a1a1a",
                  border: "none",
                  borderRadius: "4px",
                  color: selectedTemplate ? "#fff" : "#555",
                  fontSize: "0.85rem",
                  cursor: selectedTemplate ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                📂 Load
              </button>
            </div>
          )}
          {templateMsg && (
            <p
              style={{
                color: templateMsg.startsWith("✅") ? "#0f0" : "#f55",
                fontSize: "0.75rem",
                margin: "6px 0 0",
              }}
            >
              {templateMsg}
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ ...labelStyle, color: "#fff", fontSize: "0.85rem" }}>
              📋 Production plan — Google Sheet URL, CSV upload, or paste a row
            </label>
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="Public Google Sheet URL (shared as Anyone with the link)"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLoadSheet();
                }}
                style={{
                  ...inputStyle,
                  flex: 1,
                  fontFamily: "monospace",
                  fontSize: "0.72rem",
                }}
              />
              <button
                type="button"
                onClick={() => handleLoadSheet()}
                disabled={sheetLoading || !sheetUrl.trim()}
                style={{
                  padding: "0.6rem 1rem",
                  background: sheetUrl.trim() && !sheetLoading ? "#16a34a" : "#1a1a1a",
                  border: "none",
                  borderRadius: "4px",
                  color: sheetUrl.trim() && !sheetLoading ? "#fff" : "#555",
                  fontSize: "0.85rem",
                  cursor: sheetUrl.trim() && !sheetLoading ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                {sheetLoading ? "Loading..." : "🌐 Load Sheet"}
              </button>
            </div>
            <textarea
              rows={4}
              placeholder={
                '2026-10-11 17:15,The Matrix (1999) [TMDB: 603],tt0133093,"voiceover script…","[{""start"": 115.58, ""duration"": 1.5, …}]",52,To-do'
              }
              value={rowText}
              onChange={(e) => setRowText(e.target.value)}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "monospace",
                fontSize: "0.72rem",
              }}
            />
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                style={{ display: "none" }}
                onChange={(e) => {
                  void handleFilePicked(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "0.6rem 1rem",
                  background: "#6366f1",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                📄 Upload CSV
              </button>
              <button
                type="button"
                onClick={handleParse}
                disabled={!rowText.trim()}
                style={{
                  padding: "0.6rem 1rem",
                  background: rowText.trim() ? "#6366f1" : "#1a1a1a",
                  border: "none",
                  borderRadius: "4px",
                  color: rowText.trim() ? "#fff" : "#555",
                  fontSize: "0.85rem",
                  cursor: rowText.trim() ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                🔍 Parse Row
              </button>
              {rowError && (
                <span
                  style={{
                    color: "#f55",
                    fontSize: "0.78rem",
                    alignSelf: "center",
                    wordBreak: "break-all",
                  }}
                >
                  ❌ {rowError}
                </span>
              )}
            </div>
            {sheetRows.length > 0 && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span style={{ color: "#555", fontSize: "0.72rem" }}>
                    {sheetRows.length} To-do row{sheetRows.length > 1 ? "s" : ""} — click to select:
                  </span>
                  <button
                    type="button"
                    onClick={() => sheetRows.forEach((r) => enqueueRow(r, false))}
                    style={{
                      padding: "0.25rem 0.6rem",
                      background: "#16a34a",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                    }}
                  >
                    ⚡ Queue all
                  </button>
                </div>
                {sheetRows.map((row) => (
                  <div
                    key={`${row.date}_${row.title}`}
                    onClick={() => selectSheetRow(row)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "5px",
                      cursor: "pointer",
                      border: parsed === row ? "1px solid #e50914" : "1px solid #333",
                      background: parsed === row ? "#2a0a0a" : "#111",
                      color: "#fff",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.date.split(" ").slice(0, 2).join(" ")} · <b>{row.title}</b> ·{" "}
                      {row.wordCount}w · {row.clips.length} cuts · {row.planSec.toFixed(0)}s plan
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        enqueueRow(row);
                      }}
                      style={{
                        padding: "0.2rem 0.55rem",
                        background: "#e50914",
                        border: "none",
                        borderRadius: "4px",
                        color: "#fff",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ＋ Queue
                    </button>
                  </div>
                ))}
              </div>
            )}
            {parsed && (
              <div
                style={{
                  background: "#0a2a0a",
                  border: "1px solid #1a4a1a",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>
                    ✅ {parsed.title}
                  </span>
                  <span style={{ color: "#0f0", fontSize: "0.75rem" }}>
                    {parsed.wordCount} words · {parsed.clips.length} cuts ·{" "}
                    {parsed.planSec.toFixed(1)}s plan
                    {parsed.estSec ? ` (sheet est ${parsed.estSec}s)` : ""} ·{" "}
                    {parsed.progress || "no status"}
                  </span>
                </div>
                {parsed.imdb && (
                  <p style={{ color: "#7a7", fontSize: "0.7rem", margin: "4px 0 0" }}>
                    imdb {parsed.imdb}
                  </p>
                )}
                {parsed.warnings.map((w) => (
                  <p key={w} style={{ color: "#fa4", fontSize: "0.72rem", margin: "4px 0 0" }}>
                    ⚠ {w}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>M3U8 URL</label>
            {queueMsg && (
              <p style={{ color: "#0f0", fontSize: "0.75rem", margin: "0 0 4px" }}>{queueMsg}</p>
            )}
            <textarea
              rows={2}
              value={m3u8Url}
              onChange={(e) => setM3u8Url(e.target.value)}
              placeholder="https://...master.m3u8?token=..."
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "monospace",
                fontSize: "0.72rem",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Voice (Kokoro)</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>TTS speed — {ttsSpeed.toFixed(2)}x</label>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.05}
                value={ttsSpeed}
                onChange={(e) => setTtsSpeed(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#e50914", marginTop: "6px" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#555",
                  fontSize: "0.7rem",
                }}
              >
                <span>slower</span>
                <span>1.0 natural</span>
                <span>faster</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #222", paddingTop: "1rem" }}>
            <label style={{ ...labelStyle, color: "#fff", fontSize: "0.85rem" }}>🎛 Editor</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Zoom — {Number(zoom).toFixed(1)}x</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                  style={{ width: "100%", accentColor: "#e50914", marginTop: "6px" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#555",
                    fontSize: "0.7rem",
                  }}
                >
                  <span>1x</span>
                  <span>2x</span>
                  <span>3x</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Background</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                  {(["blur", "black"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBg(opt)}
                      style={{
                        flex: 1,
                        padding: "0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        border: bg === opt ? "2px solid #e50914" : "1px solid #333",
                        background: bg === opt ? "#2a0a0a" : "#111",
                        color: bg === opt ? "#fff" : "#666",
                      }}
                    >
                      {opt === "blur" ? "🌫 Blur" : "⬛ Black"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {bg === "blur" && (
              <div style={{ marginTop: "0.5rem" }}>
                <label style={labelStyle}>Blur intensity — {blurIntensity}</label>
                <input
                  type="range"
                  min={2}
                  max={60}
                  value={blurIntensity}
                  onChange={(e) => setBlurIntensity(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#e50914" }}
                />
              </div>
            )}

            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Text overlay</label>
              <textarea
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder={
                  "Hook title / caption&#10;New lines for multiple lines — burns into final video"
                }
                rows={3}
                style={{ ...inputStyle, resize: "vertical", marginBottom: "0.75rem" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>Horizontal — {textX}%</label>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={textX}
                    onChange={(e) => setTextX(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#e50914" }}
                  />
                  <label style={{ ...labelStyle, marginTop: "0.5rem" }}>Vertical — {textY}%</label>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={textY}
                    onChange={(e) => setTextY(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#e50914" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Font size — {textSize}px</label>
                  <input
                    type="range"
                    min={24}
                    max={120}
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#e50914", marginTop: "4px" }}
                  />
                  <label style={{ ...labelStyle, marginTop: "0.5rem" }}>Font</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {[
                      "Arial",
                      "Impact",
                      "Georgia",
                      "Helvetica",
                      "Times New Roman",
                      "Courier New",
                      "Verdana",
                      "Trebuchet MS",
                    ].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    style={{
                      width: "100%",
                      height: "80px",
                      border: "1px solid #333",
                      borderRadius: "4px",
                      background: "#111",
                      cursor: "pointer",
                      padding: "2px",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "4px",
                  marginTop: "0.75rem",
                }}
              >
                {(
                  [
                    ["regular", "Regular"],
                    ["bold", "Bold"],
                    ["italic", "Italic"],
                    ["bolditalic", "Bold Italic"],
                  ] as const
                ).map(([val, lb]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFontStyle(val)}
                    style={{
                      padding: "0.4rem",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      border: fontStyle === val ? "2px solid #e50914" : "1px solid #333",
                      background: fontStyle === val ? "#2a0a0a" : "#111",
                      color: fontStyle === val ? "#fff" : "#666",
                    }}
                  >
                    {lb}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRender}
            disabled={!parsed || !m3u8Url.trim()}
            style={{
              padding: "0.75rem",
              background: parsed && m3u8Url.trim() ? "#e50914" : "#1a1a1a",
              border: "none",
              borderRadius: "4px",
              color: parsed && m3u8Url.trim() ? "#fff" : "#555",
              fontSize: "1rem",
              cursor: parsed && m3u8Url.trim() ? "pointer" : "not-allowed",
            }}
          >
            🎬 Render Short
            {parsed ? ` — voiceover + ${parsed.clips.length} cuts` : ""}
          </button>
        </div>

        {renderJobs.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "0 0 0.5rem",
              }}
            >
              <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0 }}>
                Job queue —{" "}
                {
                  renderJobs.filter((j) => j.jobStatus === "running" || j.jobStatus === "queued")
                    .length
                }{" "}
                active
              </p>
              <button
                type="button"
                onClick={clearFinished}
                style={{
                  padding: "0.25rem 0.6rem",
                  background: "transparent",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  color: "#555",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                }}
              >
                Clear finished
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {renderJobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor:
                      job.jobStatus === "done"
                        ? "#0f0"
                        : job.jobStatus === "error"
                          ? "#f55"
                          : job.jobStatus === "queued"
                            ? "#333"
                            : "#e50914",
                    background:
                      job.jobStatus === "done"
                        ? "#0a2a0a"
                        : job.jobStatus === "error"
                          ? "#2a0a0a"
                          : job.jobStatus === "queued"
                            ? "#0d0d0d"
                            : "#111",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {job.title}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        color:
                          job.jobStatus === "done"
                            ? "#0f0"
                            : job.jobStatus === "error"
                              ? "#f55"
                              : job.jobStatus === "queued"
                                ? "#555"
                                : "#e50914",
                      }}
                    >
                      {job.jobStatus === "queued"
                        ? "⏱ queued"
                        : `${STAGE_ICON[job.stage] ?? "•"} ${job.stage} · ${job.elapsed}s${job.stage === "slicing" ? ` · ${job.clipsDone}/${job.clipsTotal} cuts` : ""}`}
                    </span>
                  </div>
                  {job.jobStatus === "running" && (
                    <>
                      <div
                        style={{
                          marginTop: "6px",
                          background: "#333",
                          borderRadius: "3px",
                          height: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background: "#e50914",
                            borderRadius: "3px",
                            width: `${job.clipsTotal ? Math.round((job.clipsDone / job.clipsTotal) * 92) + (job.stage === "voiceover" ? 4 : 0) : 4}%`,
                            transition: "width 1s linear",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelRender(job)}
                        style={{
                          marginTop: "6px",
                          padding: "0.2rem 0.6rem",
                          background: "transparent",
                          border: "1px solid #555",
                          borderRadius: "3px",
                          color: "#aaa",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        ✕ Cancel
                      </button>
                    </>
                  )}
                  {job.jobStatus === "queued" && (
                    <button
                      type="button"
                      onClick={() => removeJob(job.id)}
                      style={{
                        marginTop: "6px",
                        padding: "0.2rem 0.6rem",
                        background: "transparent",
                        border: "1px solid #555",
                        borderRadius: "3px",
                        color: "#aaa",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      ✕ Remove from queue
                    </button>
                  )}
                  {job.jobStatus === "done" && job.outPath && (
                    <p
                      style={{
                        color: "#7a7",
                        fontSize: "0.7rem",
                        margin: "4px 0 0",
                        wordBreak: "break-all",
                      }}
                    >
                      💾 {job.outPath}
                    </p>
                  )}
                  {job.jobStatus === "error" && job.error && (
                    <p
                      style={{
                        color: "#f55",
                        fontSize: "0.72rem",
                        margin: "4px 0 0",
                        wordBreak: "break-all",
                      }}
                    >
                      {job.error.slice(0, 300)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {saved.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <p style={{ color: "#aaa", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>
              This session — {saved.length} file{saved.length > 1 ? "s" : ""} saved
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {saved.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #1a4a1a",
                    background: "#0a2a0a",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.title} {s.year && `(${s.year})`}
                    </span>
                    <span style={{ color: "#0f0", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {s.entries} lines · {(s.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <p
                    style={{
                      color: "#7a7",
                      fontSize: "0.7rem",
                      margin: "4px 0 0",
                      wordBreak: "break-all",
                    }}
                  >
                    {s.path}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          position: "sticky",
          top: "2rem",
          alignSelf: "flex-start",
        }}
      >
        <p style={{ color: "#aaa", fontSize: "0.8rem", margin: 0 }}>Preview</p>
        <div
          style={{
            position: "relative",
            width: 360,
            height: 640,
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #333",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            background: "#000",
          }}
        >
          {bg === "blur" ? (
            <img
              src="/preview.jpg"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: `blur(${Math.round((blurIntensity / 60) * 20 + 2)}px)`,
                transform: "scale(1.15)",
              }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#000" }} />
          )}
          <img
            src="/preview.jpg"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${Number(zoom)})`,
              width: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          <canvas
            ref={canvasRef}
            width={360}
            height={640}
            style={{ position: "absolute", inset: 0, display: "block" }}
          />
        </div>
        <p style={{ color: "#555", fontSize: "0.7rem", margin: 0 }}>1080×1920 frame</p>
      </div>
    </div>
  );
}
