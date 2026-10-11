import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef, useCallback } from "react";
import * as Select from "@radix-ui/react-select";

export const Route = createFileRoute("/admin/reel")({
  component: ReelMakerPage,
});

const activePids: Record<string, number> = {};

const generateReel = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { m3u8Url: string; startSeconds: number; duration: number; outputName: string; outputDir?: string; zoom: number; bg: "blur" | "black"; blurIntensity: number; overlayText: string; textSize: number; textColor: string; textX: number; textY: number; fontFamily: string; fontStyle: string; subtitles?: Array<{ start: number; end: number; text: string }>; subFontSize?: number; subColor?: string; subVPos?: number; jobKey?: string } }) => {
    const { default: path } = await import("path");
    const { default: os } = await import("os");
    const { spawn, execFile } = await import("child_process");
    const { m3u8Url, startSeconds, duration, outputName, outputDir, zoom, bg, blurIntensity, overlayText, textSize, textColor, textX, textY, fontFamily, fontStyle, subtitles, subFontSize = 44, subColor = "#ffffff", subVPos = 90, jobKey } = data;
    const dir = outputDir || path.join(os.homedir(), "Desktop");
    const outPath = path.join(dir, outputName.endsWith(".mp4") ? outputName : outputName + ".mp4");

    // Detect source dimensions using ffprobe to get actual height
    const baseUrl = new URL(m3u8Url);
    const referer = `${baseUrl.protocol}//${baseUrl.hostname}/`;
    const headers = [
      `Referer: ${referer}\r\n`,
      `Origin: ${baseUrl.protocol}//${baseUrl.hostname}\r\n`,
      "User-Agent: Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36\r\n",
    ].join("");

    // Fetch master playlist and extract highest bandwidth variant URL
    const masterRes = await fetch(m3u8Url, {
      headers: {
        "Referer": referer,
        "Origin": `${baseUrl.protocol}//${baseUrl.hostname}`,
        "User-Agent": "Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36",
      },
    });
    const masterText = await masterRes.text();

    // Parse variants: find highest BANDWIDTH
    let bestBandwidth = 0;
    let bestVariantPath = "";
    const lines = masterText.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#EXT-X-STREAM-INF")) {
        const bwMatch = line.match(/BANDWIDTH=(\d+)/);
        const bw = bwMatch ? parseInt(bwMatch[1]) : 0;
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !nextLine.startsWith("#") && bw > bestBandwidth) {
          bestBandwidth = bw;
          bestVariantPath = nextLine;
        }
      }
    }

    // Resolve variant URL — handle absolute paths (/pl/...), relative, or full URLs
    const origin = `${baseUrl.protocol}//${baseUrl.hostname}`;
    let variantUrl = bestVariantPath;
    if (bestVariantPath.startsWith("/")) {
      variantUrl = origin + bestVariantPath;
    } else if (!bestVariantPath.startsWith("http")) {
      variantUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1) + bestVariantPath;
    }
    // Carry token from master URL if variant doesn't have one
    if (variantUrl && !variantUrl.includes("token=") && m3u8Url.includes("token=")) {
      const token = m3u8Url.split("token=")[1];
      variantUrl += (variantUrl.includes("?") ? "&" : "?") + "token=" + token;
    }

    const streamUrl = variantUrl || m3u8Url;

    // Probe actual source dimensions from the chosen variant
    const probeJson = await new Promise<string>((resolve, reject) => {
      execFile("ffprobe", [
        "-headers", headers,
        "-v", "quiet", "-print_format", "json", "-show_streams",
        streamUrl,
      ], (err, stdout) => err ? reject(err) : resolve(stdout));
    });
    const streams = JSON.parse(probeJson).streams ?? [];
    const best = (streams.filter((s: any) => s.codec_type === "video") as any[])
      .reduce((a: any, b: any) => (b.width > a.width ? b : a), { width: 1920, height: 800 });
    const srcH: number = best?.height ?? 800;
    const srcW: number = best?.width ?? 1920;

    // fg: scale so zoom=1 fits exactly 1080px wide; higher zoom crops into center
    const targetW = Math.round(1080 * zoom);
    const fgFilter = `scale=${targetW}:-2,crop=1080:min(ih\\,1920)`;

    const blurVal = Math.round(blurIntensity);
    const bgLayer = bg === "blur"
      ? `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=${blurVal}:5[bg];`
      : "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,colorchannelmixer=0:0:0:0:0:0:0:0:0:0:0:0[bg];";

    const hasText = overlayText.trim().length > 0;
    // Build per-line drawtext filters so each line can center by its own width
    const textLines = hasText ? overlayText.split("\n") : [];
    const lineSpacingPx = Math.round(textSize * 1.2);
    const totalTextH = textLines.length * lineSpacingPx;
    const baseY = Math.round((textY / 100) * 1920) - Math.round(totalTextH / 2);
    // Map font family + style to Mac system font paths
    const S = "/System/Library/Fonts/Supplemental";
    const FONT_MAP: Record<string, Record<string, string>> = {
      "Arial":            { regular: `${S}/Arial.ttf`, bold: `${S}/Arial Bold.ttf`, italic: `${S}/Arial Italic.ttf`, bolditalic: `${S}/Arial Bold Italic.ttf` },
      "Impact":           { regular: `${S}/Impact.ttf`, bold: `${S}/Impact.ttf`, italic: `${S}/Impact.ttf`, bolditalic: `${S}/Impact.ttf` },
      "Georgia":          { regular: `${S}/Georgia.ttf`, bold: `${S}/Georgia Bold.ttf`, italic: `${S}/Georgia Italic.ttf`, bolditalic: `${S}/Georgia Bold Italic.ttf` },
      "Helvetica":        { regular: "/System/Library/Fonts/Helvetica.ttc", bold: "/System/Library/Fonts/Helvetica.ttc", italic: "/System/Library/Fonts/Helvetica.ttc", bolditalic: "/System/Library/Fonts/Helvetica.ttc" },
      "Times New Roman":  { regular: `${S}/Times New Roman.ttf`, bold: `${S}/Times New Roman Bold.ttf`, italic: `${S}/Times New Roman Italic.ttf`, bolditalic: `${S}/Times New Roman Bold Italic.ttf` },
      "Courier New":      { regular: `${S}/Courier New.ttf`, bold: `${S}/Courier New Bold.ttf`, italic: `${S}/Courier New Italic.ttf`, bolditalic: `${S}/Courier New Bold Italic.ttf` },
      "Verdana":          { regular: `${S}/Verdana.ttf`, bold: `${S}/Verdana Bold.ttf`, italic: `${S}/Verdana Italic.ttf`, bolditalic: `${S}/Verdana Bold Italic.ttf` },
      "Trebuchet MS":     { regular: `${S}/Trebuchet MS.ttf`, bold: `${S}/Trebuchet MS Bold.ttf`, italic: `${S}/Trebuchet MS Italic.ttf`, bolditalic: `${S}/Trebuchet MS Bold Italic.ttf` },
    };
    const fontFile = FONT_MAP[fontFamily]?.[fontStyle] ?? "/Library/Fonts/Arial.ttf";
    // One drawtext per line — each centers itself via (W-text_w)/2
    const { writeFileSync } = await import("fs");
    const ts = Date.now();
    const tempFiles: string[] = [];
    const textFilter = textLines.map((line, i) => {
      const lineY = baseY + i * lineSpacingPx;
      const tf = path.join(os.tmpdir(), `drawtext_${ts}_${i}.txt`);
      writeFileSync(tf, line, "utf8");
      tempFiles.push(tf);
      return `,drawtext=textfile='${tf}':fontfile='${fontFile}':fontsize=${textSize}:fontcolor=${textColor}:x=(W-text_w)/2:y=${lineY}:shadowcolor=black:shadowx=2:shadowy=2`;
    }).join("");

    // Build per-entry drawtext subtitle filters using enable='between(t,start,end)'
    const subY = Math.round((subVPos / 100) * 1920);
    const subtitlesFilter = (subtitles && subtitles.length > 0)
      ? subtitles.map((sub, i) => {
          const subLines = sub.text.split("\n");
          const subLineH = Math.round(subFontSize * 1.3);
          const totalSubH = subLines.length * subLineH;
          const subBaseY = subY - Math.round(totalSubH / 2);
          return subLines.map((line, li) => {
            const tf = path.join(os.tmpdir(), `sub_${ts}_${i}_${li}.txt`);
            writeFileSync(tf, line, "utf8");
            tempFiles.push(tf);
            const lineY = subBaseY + li * subLineH;
            return `,drawtext=textfile='${tf}':fontfile='${fontFile}':fontsize=${subFontSize}:fontcolor=${subColor}:x=(W-text_w)/2:y=${lineY}:shadowcolor=black:shadowx=2:shadowy=2:enable='between(t,${sub.start.toFixed(3)},${sub.end.toFixed(3)})'`;
          }).join("");
        }).join("")
      : "";

    const filterComplex = bgLayer +
      `[0:v]${fgFilter}[fg];` +
      `[bg][fg]overlay=(W-w)/2:(H-h)/2${textFilter}${subtitlesFilter}`;

    const args = [
      "-y", "-headers", headers,
      "-ss", String(startSeconds),
      "-i", streamUrl,
      "-t", String(duration),
      "-filter_complex", filterComplex,
      "-c:v", "libx264", "-b:v", "8000k", "-minrate", "6000k", "-maxrate", "10000k", "-bufsize", "16000k", "-preset", "slow", "-c:a", "aac", "-b:a", "256k",
      outPath,
    ];

    const key = jobKey ?? `${ts}`;
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("ffmpeg", args);
      if (proc.pid) activePids[key] = proc.pid;
      let stderr = "";
      proc.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });
      proc.on("close", (code) => {
        delete activePids[key];
        code === 0 ? resolve() : reject(new Error(stderr.slice(-500)));
      });
      proc.on("error", (e) => { delete activePids[key]; reject(e); });
    });

    const { unlinkSync } = await import("fs");
    for (const tf of tempFiles) { try { unlinkSync(tf); } catch {} }

    return { path: outPath, pid: activePids[jobKey] ?? 0 };
  });

const grabM3u8 = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { tmdbId: number; type: "movie" | "tv"; season?: number; episode?: number } }) => {
    const { default: puppeteer } = await import("puppeteer");
    const embedUrl = data.type === "movie"
      ? `https://vsembed.ru/embed/movie/${data.tmdbId}/`
      : `https://vsembed.ru/embed/tv/${data.tmdbId}/${data.season ?? 1}/${data.episode ?? 1}/`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled", "--autoplay-policy=no-user-gesture-required"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    let m3u8Url = "";

    // Intercept both requests and responses
    page.on("request", req => {
      const url = req.url();
      if ((url.includes(".m3u8") || url.includes("master")) && !m3u8Url) m3u8Url = url;
    });
    page.on("response", async res => {
      const url = res.url();
      if ((url.includes(".m3u8") || url.includes("master")) && !m3u8Url) m3u8Url = url;
    });

    await page.goto(embedUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Click anything that looks like a play button
    const selectors = ["video", ".play", ".play-btn", ".jw-icon-display", ".plyr__control--overlaid", "button", "[class*='play']", "[class*='Play']"];
    for (const sel of selectors) {
      if (m3u8Url) break;
      try { await page.click(sel); await new Promise(r => setTimeout(r, 2000)); } catch {}
    }

    // Wait up to 15s more for m3u8 to appear
    for (let i = 0; i < 15 && !m3u8Url; i++) {
      await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();
    if (!m3u8Url) throw new Error("Could not find m3u8 URL — vsembed may require interaction");
    return { url: m3u8Url };
  });

const TEMPLATE_DIR = `${process.env.HOME}/Desktop/reel-templates`;

const pickFolder = createServerFn({ method: "GET" })
  .handler(async () => {
    const { execFile } = await import("child_process");
    const script = `tell application "Finder" to set f to choose folder with prompt "Select output folder"\nreturn POSIX path of f`;
    return new Promise<{ path: string }>((resolve, reject) => {
      execFile("osascript", ["-e", script], (err, stdout) => {
        if (err) reject(new Error("Folder picker cancelled"));
        else resolve({ path: stdout.trim() });
      });
    });
  });

const saveTemplate = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { name: string; settings: Record<string, any> } }) => {
    const { mkdirSync, writeFileSync } = await import("fs");
    mkdirSync(TEMPLATE_DIR, { recursive: true });
    const { default: path } = await import("path");
    const safe = data.name.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "template";
    writeFileSync(path.join(TEMPLATE_DIR, `${safe}.json`), JSON.stringify(data.settings, null, 2), "utf8");
    return { name: safe };
  });

const listTemplates = createServerFn({ method: "GET" })
  .handler(async () => {
    const { readdirSync, mkdirSync } = await import("fs");
    mkdirSync(TEMPLATE_DIR, { recursive: true });
    const files = readdirSync(TEMPLATE_DIR).filter(f => f.endsWith(".json")).map(f => f.replace(".json", ""));
    return { templates: files };
  });

const loadTemplate = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { name: string } }) => {
    const { readFileSync } = await import("fs");
    const { default: path } = await import("path");
    const raw = readFileSync(path.join(TEMPLATE_DIR, `${data.name}.json`), "utf8");
    return { settings: JSON.parse(raw) };
  });

const fetchSubtitles = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { tmdbId: number; lang?: string } }) => {
    const { tmdbId, lang = "eng" } = data;

    // Step 1: get IMDB ID from vidsrc metadata API
    const metaRes = await fetch(`https://data.vidsrc.sh/api.php?type=movie&tmdb=${tmdbId}`, {
      headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://stellarconductornexus.com/" },
    });
    const metaJson = await metaRes.json() as any;
    const imdbRaw: string = metaJson?.data?.imdb_id ?? "";
    const imdbId = imdbRaw.replace(/^tt/i, "");
    if (!imdbId) throw new Error("Could not find IMDB ID for this movie");

    // Step 2: search OpenSubtitles
    const searchUrl = `https://rest.opensubtitles.org/search/imdbid-${imdbId}/sublanguageid-${lang}`;
    const searchRes = await fetch(searchUrl, { headers: { "X-User-Agent": "trailers.to-UA", "User-Agent": "Mozilla/5.0" } });
    const results: any[] = await searchRes.json();
    if (!results?.length) throw new Error(`No ${lang} subtitles found for TMDB ${tmdbId}`);

    // Pick subtitle with most downloads
    const best = results.sort((a, b) => Number(b.SubDownloadsCnt) - Number(a.SubDownloadsCnt))[0];
    const downloadLink: string = best.SubDownloadLink;
    if (!downloadLink) throw new Error("No download link in subtitle result");

    // Step 3: download and decompress the .gz SRT
    const gzRes = await fetch(downloadLink, { headers: { "User-Agent": "Mozilla/5.0", "X-User-Agent": "trailers.to-UA" } });
    if (!gzRes.ok) throw new Error(`Failed to download subtitle: ${gzRes.status}`);
    const gzBuf = Buffer.from(await gzRes.arrayBuffer());
    const { gunzipSync } = await import("zlib");
    const srtText = gunzipSync(gzBuf).toString("utf8");

    // Step 4: parse SRT → array of {start, end, text}
    const toSec = (ts: string) => {
      const [h, m, rest] = ts.trim().split(":");
      const [s, ms] = rest.replace(",", ".").split(".");
      return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms || 0) / 1000;
    };
    const entries: Array<{ start: number; end: number; text: string }> = [];
    const blocks = srtText.replace(/\r\n/g, "\n").split(/\n\s*\n/);
    for (const block of blocks) {
      const lines = block.trim().split("\n");
      if (lines.length < 2) continue;
      const tcLine = lines.find(l => l.includes("-->"));
      if (!tcLine) continue;
      const [startStr, endStr] = tcLine.split("-->");
      const text = lines.slice(lines.indexOf(tcLine) + 1).join("\n").replace(/<[^>]+>/g, "").trim();
      if (!text) continue;
      entries.push({ start: toSec(startStr), end: toSec(endStr), text });
    }
    if (!entries.length) throw new Error("Parsed 0 subtitle entries");
    return { entries, label: best.SubFileName ?? "subtitles" };
  });

const cancelJob = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { pid: number } }) => {
    try { process.kill(data.pid, "SIGTERM"); } catch {}
    return { ok: true };
  });

const getJobPid = createServerFn({ method: "GET" })
  .handler(async ({ data }: { data: { jobKey: string } }) => {
    return { pid: activePids[data.jobKey] ?? 0 };
  });

const getFileSize = createServerFn({ method: "GET" })
  .handler(async ({ data }: { data: { filePath: string } }) => {
    const { statSync } = await import("fs");
    try {
      const stat = statSync(data.filePath);
      return { size: stat.size };
    } catch {
      return { size: 0 };
    }
  });

function TimeSpinner({ max, value, onChange, label }: { max: number; value: number; onChange: (v: number) => void; label: string }) {
  const opts = Array.from({ length: max + 1 }, (_, i) => String(i).padStart(2, "0"));
  return (
    <Select.Root value={String(value).padStart(2, "0")} onValueChange={v => onChange(Number(v))}>
      <Select.Trigger style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#111", border: "1px solid #333", borderRadius: "4px",
        color: "#fff", padding: "0.5rem 0.4rem", fontSize: "1rem", cursor: "pointer",
        width: "52px", gap: "2px",
      }}>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", zIndex: 9999, maxHeight: "200px", overflowY: "auto" }}>
          <Select.Viewport>
            {opts.map(o => (
              <Select.Item key={o} value={o} style={{ padding: "6px 16px", color: "#fff", cursor: "pointer", fontSize: "0.95rem", outline: "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#333")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Select.ItemText>{o}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

type JobStatus = "queued" | "running" | "done" | "error";
type Job = {
  id: string;
  outputName: string;
  outPath: string;
  params: Parameters<typeof generateReel>[0]["data"];
  status: JobStatus;
  elapsed: number;
  fileSize: number;
  error: string;
  pid?: number;
};

function ReelMakerPage() {
  const [m3u8Url, setM3u8Url] = useState("");
  const [startH, setStartH] = useState(0);
  const [startM, setStartM] = useState(30);
  const [startS, setStartS] = useState(0);
  const [duration, setDuration] = useState("30");
  const [outputName, setOutputName] = useState("");
  const [outputDir, setOutputDir] = useState("");
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
  const [subtitleEntries, setSubtitleEntries] = useState<Array<{ id: string; start: string; end: string; text: string }>>([]);
  const [subFetchId, setSubFetchId] = useState("");
  const [subFetchStatus, setSubFetchStatus] = useState<"idle" | "fetching" | "done" | "error">("idle");
  const [subFetchError, setSubFetchError] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateMsg, setTemplateMsg] = useState("");
  const [subFontSize, setSubFontSize] = useState(44);
  const [subColor, setSubColor] = useState("#ffffff");
  const [subVPos, setSubVPos] = useState(90);
  const [previewTime, setPreviewTime] = useState(0);
  const [grabId, setGrabId] = useState("");
  const [grabType, setGrabType] = useState<"movie" | "tv">("movie");
  const [grabSeason, setGrabSeason] = useState("1");
  const [grabEpisode, setGrabEpisode] = useState("1");
  const [grabStatus, setGrabStatus] = useState<"idle" | "grabbing" | "done" | "error">("idle");
  const [grabError, setGrabError] = useState("");
  const [queue, setQueue] = useState<Job[]>([]);
  const pollsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const pidRef = useRef<Record<string, number>>({});

  function updateJob(id: string, patch: Partial<Job>) {
    setQueue(q => q.map(j => j.id === id ? { ...j, ...patch } : j));
  }

  async function handleGrab() {
    const id = Number(grabId);
    if (!id) return;
    setGrabStatus("grabbing");
    setGrabError("");
    try {
      const res = await grabM3u8({ data: { tmdbId: id, type: grabType, season: Number(grabSeason), episode: Number(grabEpisode) } });
      setM3u8Url(res.url);
      setGrabStatus("done");
    } catch (err: any) {
      setGrabStatus("error");
      setGrabError(err.message ?? "Failed to grab URL");
    }
  }

  useEffect(() => {
    listTemplates().then(r => setTemplates(r.templates)).catch(() => {});
  }, []);

  function currentSettings() {
    return { zoom, bg, blurIntensity, overlayText, textSize, textColor, textX, textY, fontFamily, fontStyle, subFontSize, subColor, subVPos, outputDir, subFetchId };
  }

  async function handleSaveTemplate() {
    const name = templateName.trim();
    if (!name) return;
    try {
      await saveTemplate({ data: { name, settings: currentSettings() } });
      const r = await listTemplates();
      setTemplates(r.templates);
      setTemplateMsg(`✅ Saved "${name}"`);
      setTimeout(() => setTemplateMsg(""), 2500);
    } catch { setTemplateMsg("❌ Save failed"); }
  }

  async function handleLoadTemplate() {
    if (!selectedTemplate) return;
    try {
      const { settings: s } = await loadTemplate({ data: { name: selectedTemplate } });
      if (s.zoom !== undefined) setZoom(String(s.zoom));
      if (s.bg) setBg(s.bg);
      if (s.blurIntensity !== undefined) setBlurIntensity(s.blurIntensity);
      if (s.overlayText !== undefined) setOverlayText(s.overlayText);
      if (s.textSize !== undefined) setTextSize(s.textSize);
      if (s.textColor) setTextColor(s.textColor);
      if (s.textX !== undefined) setTextX(s.textX);
      if (s.textY !== undefined) setTextY(s.textY);
      if (s.fontFamily) setFontFamily(s.fontFamily);
      if (s.fontStyle) setFontStyle(s.fontStyle);
      if (s.subFontSize !== undefined) setSubFontSize(s.subFontSize);
      if (s.subColor) setSubColor(s.subColor);
      if (s.subVPos !== undefined) setSubVPos(s.subVPos);
      if (s.outputDir !== undefined) setOutputDir(s.outputDir);
      if (s.subFetchId !== undefined) setSubFetchId(String(s.subFetchId));
      setTemplateMsg(`✅ Loaded "${selectedTemplate}"`);
      setTimeout(() => setTemplateMsg(""), 2500);
    } catch { setTemplateMsg("❌ Load failed"); }
  }

  function makeOutputName(title?: string) {
    const h = String(startH).padStart(2, "0");
    const m = String(startM).padStart(2, "0");
    const s = String(startS).padStart(2, "0");
    const base = title ? title.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") : "reel";
    return `${base}_${h}-${m}-${s}`;
  }

  async function handleFetchSubtitles() {
    const id = Number(subFetchId);
    if (!id) return;
    setSubFetchStatus("fetching");
    setSubFetchError("");
    try {
      const res = await fetchSubtitles({ data: { tmdbId: id } });
      setSubtitleEntries(res.entries.map(e => ({
        id: `sub_${e.start}`,
        start: String(e.start),
        end: String(e.end),
        text: e.text,
      })));
      // extract clean title from subtitle filename e.g. "Avengers.Endgame.2019..."
      const rawTitle = res.label.split(/[\.\s]/)[0] + (res.label.split(/[\.\s]/)[1] ? "_" + res.label.split(/[\.\s]/)[1] : "");
      setOutputName(makeOutputName(rawTitle));
      setPreviewTime(startH * 3600 + startM * 60 + startS);
      setSubFetchStatus("done");
    } catch (err: any) {
      setSubFetchStatus("error");
      setSubFetchError(err.message ?? "Failed to fetch subtitles");
    }
  }

  function handleAddToQueue(e: React.FormEvent) {
    e.preventDefault();
    const id = `job_${Date.now()}`;
    const autoName = outputName.trim() || makeOutputName();
    const name = autoName.endsWith(".mp4") ? autoName : autoName + ".mp4";
    const dir = outputDir.trim() || `${process.env.HOME ?? "/Users/mac"}/Desktop`;
    const outPath = `${dir}/${name}`;
    const job: Job = {
      id, outputName: name, outPath,
      params: {
        m3u8Url, startSeconds: startH * 3600 + startM * 60 + startS,
        duration: Number(duration), outputName: autoName, outputDir: dir,
        zoom: Number(zoom), bg, blurIntensity,
        overlayText: wrappedTextRef.current || overlayText,
        textSize, textColor, textX, textY, fontFamily, fontStyle,
        subtitles: subtitleEntries
          .filter(s => s.text.trim() && s.start !== "" && s.end !== "")
          .map(s => ({ start: Number(s.start) - (startH * 3600 + startM * 60 + startS), end: Number(s.end) - (startH * 3600 + startM * 60 + startS), text: s.text.trim() }))
          .filter(s => s.end > 0 && s.start < Number(duration)),
        subFontSize, subColor, subVPos,
      },
      status: "queued", elapsed: 0, fileSize: 0, error: "",
    };
    setQueue(q => [...q, job]);
    // start immediately
    setTimeout(() => runJob(job), 0);
  }

  async function runJob(job: Job) {
    updateJob(job.id, { status: "running", elapsed: 0, fileSize: 0, pid: undefined });
    const start = Date.now();
    const jobKey = String(start);
    // Poll file size + grab PID once after a short delay
    let pidFetched = false;
    pollsRef.current[job.id] = setInterval(async () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const res = await getFileSize({ data: { filePath: job.outPath } });
      updateJob(job.id, { elapsed, fileSize: res.size });
      if (!pidFetched && elapsed >= 1) {
        pidFetched = true;
        const p = await getJobPid({ data: { jobKey } });
        if (p.pid) { pidRef.current[job.id] = p.pid; updateJob(job.id, { pid: p.pid }); }
      }
    }, 1000);
    try {
      await generateReel({ data: { ...job.params, jobKey } as any });
      clearInterval(pollsRef.current[job.id]);
      delete pidRef.current[job.id];
      const elapsed = Math.floor((Date.now() - start) / 1000);
      updateJob(job.id, { status: "done", elapsed });
    } catch (err: any) {
      clearInterval(pollsRef.current[job.id]);
      delete pidRef.current[job.id];
      const msg = err.message ?? "Failed";
      updateJob(job.id, { status: msg.includes("SIGTERM") ? "queued" : "error", error: msg.includes("SIGTERM") ? "" : msg });
    }
  }

  async function handleCancelJob(job: Job) {
    const pid = pidRef.current[job.id] || job.pid;
    if (pid) await cancelJob({ data: { pid } });
    clearInterval(pollsRef.current[job.id]);
    delete pidRef.current[job.id];
    updateJob(job.id, { status: "error", error: "Cancelled" });
  }

  function handleRunAll() {
    const queued = queue.filter(j => j.status === "queued");
    queued.forEach(runJob);
  }

  useEffect(() => {
    return () => { Object.values(pollsRef.current).forEach(clearInterval); };
  }, []);

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem", borderRadius: "4px", border: "1px solid #333",
    background: "#111", color: "#fff", fontSize: "0.95rem", width: "100%", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    color: "#aaa", fontSize: "0.8rem", marginBottom: "4px", display: "block",
  };


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const wrappedTextRef = useRef<string>("");

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { previewImgRef.current = img; drawText(); };
    img.src = "/preview.jpg";
  }, []);

  const drawText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw overlay text
    if (overlayText.trim()) {
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
          if (ctx.measureText(test).width > maxPx && line) { lines.push(line); line = word; }
          else line = test;
        }
        if (line) lines.push(line);
      }
      wrappedTextRef.current = lines.join("\n");
      const lineH = fontSize * 1.2;
      const totalH = lines.length * lineH;
      const baseY = (textY / 100) * H - totalH / 2 + fontSize / 2;
      lines.forEach((line, i) => { ctx.fillText(line, x, baseY + i * lineH); });
    }

    // previewTime is in movie timecode (same as subtitle entries)
    const activeSub = subtitleEntries.find(s =>
      s.text.trim() && s.start !== "" && s.end !== "" &&
      previewTime >= Number(s.start) && previewTime < Number(s.end)
    );
    if (activeSub) {
      const subFontPx = Math.round(subFontSize * (W / 1080));
      ctx.font = `bold ${subFontPx}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = subColor;
      const cx = W / 2;
      const cy = (subVPos / 100) * H;
      const maxSubPx = W * 0.9;
      const subLines: string[] = [];
      for (const para of activeSub.text.split("\n")) {
        const words = para.split(" ");
        let line = "";
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxSubPx && line) { subLines.push(line); line = word; }
          else line = test;
        }
        if (line) subLines.push(line);
      }
      const subLineH = subFontPx * 1.3;
      const totalSubH = subLines.length * subLineH;
      const subBaseY = cy - totalSubH / 2 + subFontPx / 2;
      subLines.forEach((line, i) => { ctx.fillText(line, cx, subBaseY + i * subLineH); });
    }
  }, [overlayText, textSize, textColor, textX, textY, fontFamily, fontStyle, subtitleEntries, subFontSize, subColor, subVPos, previewTime, startH, startM, startS]);

  useEffect(() => { drawText(); }, [drawText]);

  // Auto-update output name when start time changes, unless user manually edited it
  useEffect(() => {
    setOutputName(prev => {
      if (prev && !prev.match(/^\w+_\d{2}-\d{2}-\d{2}$/)) return prev; // user typed custom name, keep it
      const base = prev ? prev.replace(/_\d{2}-\d{2}-\d{2}$/, "") : "reel";
      return makeOutputName(base || "reel");
    });
  }, [startH, startM, startS]);


  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem", gap: "2rem" }}>
      <div style={{ background: "#1a1a1a", padding: "2rem", borderRadius: "8px", width: "100%", maxWidth: "500px", flexShrink: 0 }}>
        <h2 style={{ color: "#fff", margin: "0 0 1.5rem", fontSize: "1.3rem" }}>🎬 Reel Maker</h2>

        {/* Templates */}
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "0.75rem", marginBottom: "1.5rem" }}>
          <label style={{ color: "#fff", fontSize: "0.85rem", marginBottom: "0.5rem", display: "block" }}>Templates</label>
          <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
            <input
              type="text" placeholder="Template name" value={templateName} onChange={e => setTemplateName(e.target.value)}
              style={{ padding: "0.6rem", borderRadius: "4px", border: "1px solid #333", background: "#0a0a0a", color: "#fff", fontSize: "0.95rem", flex: 1, boxSizing: "border-box" as const }}
            />
            <button type="button" onClick={handleSaveTemplate} style={{
              padding: "0.6rem 1rem", background: "#334155", border: "none", borderRadius: "4px",
              color: "#fff", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap",
            }}>💾 Save</button>
          </div>
          {templates.length > 0 && (
            <div style={{ display: "flex", gap: "6px" }}>
              <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
                style={{ padding: "0.6rem", borderRadius: "4px", border: "1px solid #333", background: "#0a0a0a", color: "#fff", fontSize: "0.95rem", flex: 1, cursor: "pointer", boxSizing: "border-box" as const }}>
                <option value="">— load template —</option>
                {templates.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="button" onClick={handleLoadTemplate} disabled={!selectedTemplate} style={{
                padding: "0.6rem 1rem", background: selectedTemplate ? "#334155" : "#1a1a1a",
                border: "none", borderRadius: "4px", color: selectedTemplate ? "#fff" : "#555",
                fontSize: "0.85rem", cursor: selectedTemplate ? "pointer" : "not-allowed", whiteSpace: "nowrap",
              }}>📂 Load</button>
            </div>
          )}
          {templateMsg && <p style={{ color: templateMsg.startsWith("✅") ? "#0f0" : "#f55", fontSize: "0.75rem", margin: "6px 0 0" }}>{templateMsg}</p>}
        </div>

        <form onSubmit={handleAddToQueue} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>M3U8 URL</label>
            <textarea
              value={m3u8Url} onChange={e => setM3u8Url(e.target.value)}
              placeholder="https://...master.m3u8?token=..."
              rows={3} required
              style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "0.75rem" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Start time</label>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <TimeSpinner max={23} value={startH} onChange={setStartH} label="H" />
                <span style={{ color: "#555" }}>:</span>
                <TimeSpinner max={59} value={startM} onChange={setStartM} label="M" />
                <span style={{ color: "#555" }}>:</span>
                <TimeSpinner max={59} value={startS} onChange={setStartS} label="S" />
              </div>
              <span style={{ color: "#555", fontSize: "0.75rem" }}>
                {String(startH).padStart(2,"0")}:{String(startM).padStart(2,"0")}:{String(startS).padStart(2,"0")}
              </span>
            </div>
            <div>
              <label style={labelStyle}>Duration (seconds)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} style={inputStyle} min="1" max="120" required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Zoom — {Number(zoom).toFixed(1)}x</label>
              <input
                type="range" min={1} max={3} step={0.1} value={zoom}
                onChange={e => setZoom(e.target.value)}
                style={{ width: "100%", accentColor: "#e50914", marginTop: "6px" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#555", fontSize: "0.7rem" }}>
                <span>1x</span><span>2x</span><span>3x</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Background</label>
              <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                {(["blur", "black"] as const).map(opt => (
                  <button key={opt} type="button" onClick={() => setBg(opt)} style={{
                    flex: 1, padding: "0.6rem", borderRadius: "4px", fontSize: "0.9rem", cursor: "pointer",
                    border: bg === opt ? "2px solid #e50914" : "1px solid #333",
                    background: bg === opt ? "#2a0a0a" : "#111", color: bg === opt ? "#fff" : "#666",
                  }}>
                    {opt === "blur" ? "🌫 Blur" : "⬛ Black"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {bg === "blur" && (
            <div>
              <label style={labelStyle}>Blur intensity — {blurIntensity}</label>
              <input
                type="range" min={2} max={60} value={blurIntensity}
                onChange={e => setBlurIntensity(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#e50914" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#555", fontSize: "0.7rem" }}>
                <span>subtle (2)</span><span>heavy (60)</span>
              </div>
            </div>
          )}

          <div style={{ borderTop: "1px solid #222", paddingTop: "1rem" }}>
            <label style={{ ...labelStyle, color: "#fff", fontSize: "0.85rem" }}>Text overlay</label>
            <textarea
              value={overlayText} onChange={e => setOverlayText(e.target.value)}
              placeholder="Leave blank for no text&#10;Use new lines for multiple lines"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", marginBottom: "0.75rem" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Horizontal — {textX}%</label>
                <input
                  type="range" min={5} max={95} value={textX}
                  onChange={e => setTextX(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#e50914" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", color: "#555", fontSize: "0.7rem", marginBottom: "0.75rem" }}>
                  <span>left</span><span>center</span><span>right</span>
                </div>
                <label style={labelStyle}>Vertical — {textY}%</label>
                <input
                  type="range" min={5} max={95} value={textY}
                  onChange={e => setTextY(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#e50914" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", color: "#555", fontSize: "0.7rem" }}>
                  <span>top</span><span>mid</span><span>bottom</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Font size — {textSize}px</label>
                <input
                  type="range" min={24} max={120} value={textSize}
                  onChange={e => setTextSize(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#e50914", marginTop: "4px" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Color</label>
                <input
                  type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                  style={{ width: "100%", height: "80px", border: "1px solid #333", borderRadius: "4px", background: "#111", cursor: "pointer", padding: "2px" }}
                />
              </div>
            </div>
            {/* Font family + style row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Font</label>
                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  {["Arial", "Impact", "Georgia", "Helvetica", "Times New Roman", "Courier New", "Verdana", "Trebuchet MS"].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Style</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                  {([["regular", "Regular"], ["bold", "Bold"], ["italic", "Italic"], ["bolditalic", "Bold Italic"]] as const).map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setFontStyle(val)} style={{
                      padding: "0.4rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer",
                      border: fontStyle === val ? "2px solid #e50914" : "1px solid #333",
                      background: fontStyle === val ? "#2a0a0a" : "#111",
                      color: fontStyle === val ? "#fff" : "#666",
                      fontWeight: val.includes("bold") ? "bold" : "normal",
                      fontStyle: val.includes("italic") ? "italic" : "normal",
                    }}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subtitles */}
          <div style={{ borderTop: "1px solid #222", paddingTop: "1rem" }}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ ...labelStyle, color: "#fff", fontSize: "0.85rem", margin: 0 }}>Subtitles</label>
            </div>

            {/* Auto-fetch from OpenSubtitles */}
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: "6px", padding: "0.6rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  type="number" placeholder="TMDB ID" value={subFetchId} onChange={e => setSubFetchId(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="button" onClick={handleFetchSubtitles} disabled={subFetchStatus === "fetching"} style={{
                  padding: "0.6rem 1rem", background: subFetchStatus === "fetching" ? "#333" : "#6366f1",
                  border: "none", borderRadius: "4px", color: "#fff", fontSize: "0.85rem",
                  cursor: subFetchStatus === "fetching" ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                }}>
                  {subFetchStatus === "fetching" ? "Fetching..." : "📥 Fetch"}
                </button>
              </div>
              {subFetchStatus === "done" && <p style={{ color: "#0f0", fontSize: "0.75rem", margin: "6px 0 0" }}>✅ {subtitleEntries.length} subtitle entries loaded</p>}
              {subFetchStatus === "error" && <p style={{ color: "#f55", fontSize: "0.75rem", margin: "6px 0 0" }}>❌ {subFetchError}</p>}
            </div>

            {/* Subtitle style controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 60px", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Font size — {subFontSize}px</label>
                <input type="range" min={20} max={100} value={subFontSize} onChange={e => setSubFontSize(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#6366f1" }} />
              </div>
              <div>
                <label style={labelStyle}>Vertical — {subVPos}%</label>
                <input type="range" min={5} max={95} value={subVPos} onChange={e => setSubVPos(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#6366f1" }} />
                <div style={{ display: "flex", justifyContent: "space-between", color: "#555", fontSize: "0.7rem" }}>
                  <span>top</span><span>bottom</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Color</label>
                <input type="color" value={subColor} onChange={e => setSubColor(e.target.value)}
                  style={{ width: "100%", height: "48px", border: "1px solid #333", borderRadius: "4px", background: "#111", cursor: "pointer", padding: "2px" }} />
              </div>
            </div>

            {/* Preview time scrubber */}
            {subtitleEntries.length > 0 && (
              <div style={{ marginBottom: "0.75rem" }}>
                {(() => {
                  const clipStart = startH * 3600 + startM * 60 + startS;
                  const clipEnd = clipStart + (Number(duration) || 30);
                  const activeSub = subtitleEntries.find(s => s.text.trim() && (previewTime) >= Number(s.start) && (previewTime) < Number(s.end));
                  return <>
                    <label style={labelStyle}>
                      Preview at — {previewTime}s{activeSub ? ` · "${activeSub.text.slice(0, 40)}"` : " · (no subtitle)"}
                    </label>
                    <input type="range" min={clipStart} max={clipEnd} step={0.5} value={previewTime}
                      onChange={e => setPreviewTime(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#6366f1" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#555", fontSize: "0.7rem" }}>
                      <span>{clipStart}s</span><span>{clipEnd}s</span>
                    </div>
                  </>;
                })()}
              </div>
            )}

            {subtitleEntries.length === 0
              ? <p style={{ color: "#555", fontSize: "0.78rem", margin: 0 }}>No subtitles loaded. Use 📥 Fetch above.</p>
              : <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a2a0a", border: "1px solid #1a4a1a", borderRadius: "4px", padding: "0.5rem 0.75rem" }}>
                  <span style={{ color: "#0f0", fontSize: "0.82rem" }}>✅ {subtitleEntries.length} subtitle entries loaded</span>
                  <button type="button" onClick={() => setSubtitleEntries([])}
                    style={{ padding: "0.2rem 0.6rem", background: "transparent", border: "1px solid #333", borderRadius: "4px", color: "#555", fontSize: "0.78rem", cursor: "pointer" }}>
                    Clear
                  </button>
                </div>
            }
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
              <label style={labelStyle}>Output directory</label>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ flex: 1, color: outputDir ? "#fff" : "#555", fontSize: "0.85rem", padding: "0.6rem", background: "#111", border: "1px solid #333", borderRadius: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {outputDir || "~/Desktop (default)"}
                </span>
                <button type="button" onClick={async () => {
                  try { const r = await pickFolder(); setOutputDir(r.path); } catch {}
                }} style={{ padding: "0.6rem 1rem", background: "#334155", border: "none", borderRadius: "4px", color: "#fff", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                  📁 Browse
                </button>
                {outputDir && <button type="button" onClick={() => setOutputDir("")} style={{ padding: "0.6rem 0.5rem", background: "transparent", border: "1px solid #333", borderRadius: "4px", color: "#555", fontSize: "0.85rem", cursor: "pointer" }}>✕</button>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Filename</label>
              <input type="text" value={outputName} onChange={e => setOutputName(e.target.value)}
                placeholder={makeOutputName()} style={inputStyle} />
              <span style={{ color: "#555", fontSize: "0.75rem" }}>
                → {(outputDir.trim() || "~/Desktop")}/{(outputName.trim() || makeOutputName())}.mp4
              </span>
            </div>
          </div>

          <button
            type="submit"
            style={{ padding: "0.75rem", background: "#e50914", border: "none", borderRadius: "4px", color: "#fff", fontSize: "1rem", cursor: "pointer" }}
          >
            ▶ Generate
          </button>
        </form>

        {/* Queue */}
        {queue.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>{queue.length} job{queue.length > 1 ? "s" : ""} in queue</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setQueue([])} style={{ padding: "0.4rem 0.75rem", background: "transparent", border: "1px solid #333", borderRadius: "4px", color: "#555", fontSize: "0.85rem", cursor: "pointer" }}>
                  Clear
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {queue.map(job => {
                const mb = (job.fileSize / 1024 / 1024).toFixed(1);
                return (
                  <div key={job.id} style={{
                    padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid",
                    borderColor: job.status === "done" ? "#0f0" : job.status === "error" ? "#f55" : job.status === "running" ? "#e50914" : "#333",
                    background: job.status === "done" ? "#0a2a0a" : job.status === "error" ? "#2a0a0a" : "#111",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>{job.outputName}</span>
                      <span style={{ fontSize: "0.75rem", color: job.status === "done" ? "#0f0" : job.status === "error" ? "#f55" : job.status === "running" ? "#e50914" : "#555" }}>
                        {job.status === "done" ? `✅ ${job.elapsed}s · ${mb} MB` : job.status === "error" ? "❌ error" : job.status === "running" ? `⏳ ${job.elapsed}s${job.fileSize > 0 ? ` · ${mb} MB` : ""}` : "queued"}
                      </span>
                    </div>
                    {job.status === "running" && (
                      <>
                        <div style={{ marginTop: "6px", background: "#333", borderRadius: "3px", height: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "#e50914", borderRadius: "3px", width: `${Math.min(100, (job.elapsed / 90) * 100)}%`, transition: "width 1s linear" }} />
                        </div>
                        <button type="button" onClick={() => handleCancelJob(job)} style={{ marginTop: "6px", padding: "0.2rem 0.6rem", background: "transparent", border: "1px solid #555", borderRadius: "3px", color: "#aaa", fontSize: "0.75rem", cursor: "pointer" }}>
                          ✕ Cancel
                        </button>
                      </>
                    )}
                    {job.status === "error" && (
                      <p style={{ color: "#f55", fontSize: "0.72rem", margin: "4px 0 0", wordBreak: "break-all" }}>{job.error.slice(0, 200)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p style={{ color: "#333", fontSize: "0.75rem", marginTop: "1.5rem" }}>
          1080×1920 · {zoom}x zoom · {bg} bg · libx264 8Mbps
        </p>
      </div>

      {/* Preview panel */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", position: "sticky", top: "2rem", alignSelf: "flex-start" }}>
        <p style={{ color: "#aaa", fontSize: "0.8rem", margin: 0 }}>Preview</p>
        <div style={{ position: "relative", width: 360, height: 640, borderRadius: "12px", overflow: "hidden", border: "1px solid #333", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", background: "#000" }}>
          {/* Background layer — blurred or black */}
          {bg === "blur" ? (
            <img
              src="/preview.jpg"
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover",
                filter: `blur(${Math.round((blurIntensity / 60) * 20 + 2)}px)`,
                transform: "scale(1.15)", // prevent blur edge artifacts
              }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#000" }} />
          )}
          {/* Foreground — zoomed movie centered */}
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
          {/* Text overlay canvas */}
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
