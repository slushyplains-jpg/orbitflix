// Local MCP server for explainer renders.
// Tools: list_templates, get_row, render_row, render_status.
// A template (saved from /admin/explainer) holds the formatting and the sheet link.
// render_row starts the renderer in the background and returns a job id.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseAllRows, type ParsedRow } from "../../src/lib/explainerRow";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(here, "../..");
const TEMPLATE_DIR = path.join(os.homedir(), "Desktop", "explainer-templates");
const JOB_DIR = path.join(os.homedir(), "Desktop", "explainer-jobs");

function loadTemplate(name: string): Record<string, unknown> {
  const safe = name.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
  const file = path.join(TEMPLATE_DIR, `${safe}.json`);
  if (!fs.existsSync(file)) throw new Error(`template "${safe}" not found in ${TEMPLATE_DIR}`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
}

function sheetExportUrl(sheetUrl: string): string {
  const g = sheetUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!g) throw new Error("the template's sheetUrl is not a Google Sheets link");
  const gid = sheetUrl.match(/[#&?]gid=(\d+)/)?.[1] ?? "0";
  return `https://docs.google.com/spreadsheets/d/${g[1]}/export?format=csv&gid=${gid}`;
}

async function loadRows(template: Record<string, unknown>): Promise<ParsedRow[]> {
  const res = await fetch(sheetExportUrl(String(template.sheetUrl ?? "")));
  if (!res.ok) throw new Error(`sheet download failed: HTTP ${res.status}`);
  return parseAllRows(await res.text(), false);
}

function findRow(rows: ParsedRow[], title: string): ParsedRow {
  const q = title.trim().toLowerCase();
  const hits = rows.filter((r) => r.title.toLowerCase().includes(q));
  if (hits.length === 0) throw new Error(`no row matches "${title}"`);
  if (hits.length > 1) throw new Error(`"${title}" matches ${hits.length} rows, use a more specific title`);
  return hits[0];
}

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });

const server = new McpServer({ name: "explainer", version: "0.1.0" });

server.registerTool(
  "list_templates",
  { description: "List the saved explainer templates." },
  async () => {
    if (!fs.existsSync(TEMPLATE_DIR)) return text("No templates folder yet.");
    const names = fs.readdirSync(TEMPLATE_DIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
    return text(names.length ? names.join("\n") : "No templates saved yet.");
  },
);

server.registerTool(
  "get_row",
  {
    description: "Read one row from the template's sheet and show its status, script length, and clip count.",
    inputSchema: { template: z.string(), title: z.string() },
  },
  async ({ template, title }) => {
    const row = findRow(await loadRows(loadTemplate(template)), title);
    return text(
      [
        `Title: ${row.title}`,
        `Status: ${row.progress || "(empty)"}`,
        `Words: ${row.wordCount}`,
        `Clips: ${row.clips.length}`,
        row.warnings.length ? `Warnings: ${row.warnings.join("; ")}` : "Warnings: none",
      ].join("\n"),
    );
  },
);

server.registerTool(
  "render_row",
  {
    description:
      "Render one sheet row with a template. The row must have status READY_FOR_LOCAL_RENDER. Give tmdb_id to fetch a stream link, or m3u8_url to reuse one (links last about four hours). Returns a job id right away.",
    inputSchema: {
      template: z.string(),
      title: z.string(),
      tmdb_id: z.number().optional(),
      media_type: z.enum(["movie", "tv"]).optional(),
      m3u8_url: z.string().optional(),
    },
  },
  async ({ template, title, tmdb_id, media_type, m3u8_url }) => {
    const tpl = loadTemplate(template);
    const row = findRow(await loadRows(tpl), title);
    if (!/^READY_FOR_LOCAL_RENDER$/i.test(row.progress.trim())) {
      throw new Error(`row "${row.title}" is not ready (status: "${row.progress || "empty"}")`);
    }
    if (!m3u8_url && !tmdb_id) throw new Error("give tmdb_id (to fetch a stream link) or m3u8_url");
    const { sheetUrl: _sheet, ...settings } = tpl;
    if (typeof settings.zoom === "string") settings.zoom = Number(settings.zoom);
    const jobId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${row.title.replace(/[^a-zA-Z0-9]+/g, "_")}`;
    fs.mkdirSync(JOB_DIR, { recursive: true });
    const jobFile = path.join(JOB_DIR, `${jobId}.json`);
    const job = {
      ...settings,
      title: row.title,
      script: row.script,
      clips: row.clips,
      tmdbId: tmdb_id,
      mediaType: media_type ?? "movie",
      m3u8Url: m3u8_url,
    };
    fs.writeFileSync(jobFile, JSON.stringify(job, null, 2), "utf8");
    const logFile = path.join(JOB_DIR, `${jobId}.log`);
    const log = fs.openSync(logFile, "w");
    const child = spawn("npx", ["-y", "tsx", path.join(projectDir, "scripts/explainer-runner.ts"), jobFile], {
      cwd: projectDir,
      detached: true,
      stdio: ["ignore", log, log],
    });
    child.unref();
    return text(`Started render of "${row.title}" with template "${template}".\nJob id: ${jobId}\nCheck with render_status.`);
  },
);

server.registerTool(
  "render_status",
  {
    description: "Show the progress of a render started with render_row.",
    inputSchema: { job_id: z.string() },
  },
  async ({ job_id }) => {
    const statusFile = path.join(JOB_DIR, `${job_id}.json.status.json`);
    const logFile = path.join(JOB_DIR, `${job_id}.log`);
    const status = fs.existsSync(statusFile) ? fs.readFileSync(statusFile, "utf8") : "No status yet (still starting).";
    const log = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8").split("\n").slice(-5).join("\n") : "";
    return text(`${status}\n\nLast log lines:\n${log}`);
  },
);

void server.connect(new StdioServerTransport());
