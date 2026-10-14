import type { ExplainerClip } from "./explainerRender";

export type ParsedRow = {
  date: string;
  title: string;
  imdb: string;
  script: string;
  wordCount: number;
  clips: ExplainerClip[];
  progress: string;
  warnings: string[];
};

function detectDelim(text: string): string {
  return (text.slice(0, 4000).match(/\t/g) ?? []).length > 2 ? "\t" : ",";
}

export function parseCsvRows(text: string, delim?: string): string[][] {
  const d = delim ?? detectDelim(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"' && field === "") inQuotes = true;
    else if (c === d) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  row.push(field);
  rows.push(row);
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

function makeRow(
  date: string,
  rawTitle: string,
  imdb: string,
  script: string,
  clips: ExplainerClip[],
  progress: string,
): ParsedRow {
  const title = rawTitle.replace(/\s*\[TMDB:\s*\d+\]\s*$/i, "").trim();
  const badOrder = clips.filter((c, i) => i > 0 && c.start <= clips[i - 1].start).length;
  const warnings: string[] = [];
  if (!script) warnings.push("Script field is empty");
  if (badOrder) warnings.push(`${badOrder} clip(s) out of chronological order`);
  return {
    date,
    title: title || "Explainer",
    imdb,
    script,
    wordCount: script.split(/\s+/).filter(Boolean).length,
    clips,
    progress,
    warnings,
  };
}

function buildRow(
  r: string[],
  idx: {
    date: number;
    title: number;
    imdb: number;
    script: number;
    clips: number;
    est: number;
    progress: number;
  },
): ParsedRow | null {
  const cell = (i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
  const jsonCell = cell(idx.clips)
    .replace(/^﻿/, "")
    .replace(/[\u201c\u201d]/g, '"');
  let clips: ExplainerClip[];
  try {
    clips = JSON.parse(jsonCell);
  } catch {
    return null;
  }
  if (!Array.isArray(clips) || !clips.length) return null;
  if (!clips.every((c) => typeof c.start === "number"))
    return null;
  return makeRow(
    cell(idx.date),
    cell(idx.title),
    cell(idx.imdb),
    cell(idx.script),
    clips,
    cell(idx.progress),
  );
}

function headerMap(header: string[]) {
  const h = header.map((x) => x.replace(/^﻿/, "").trim().toLowerCase());
  const find = (re: RegExp) => h.findIndex((x) => re.test(x));
  return {
    date: find(/date|timestamp/),
    title: find(/title/),
    imdb: find(/imdb/),
    script: find(/script/),
    clips: find(/clip|plan|json/),
    est: find(/est|duration/),
    progress: find(/progress|status/),
  };
}

const READY_VALUES = /^(to-?\s?do|ready[ _-]?for[ _-]?local[ _-]?render)$/i;

export function isTodo(progress: string): boolean {
  return READY_VALUES.test(progress.trim());
}

/**
 * Drive JSON blueprint: one object or an array of objects shaped like
 * { date, title, imdb_id, script, clips:[{clip,start,duration,quote,action}], duration, status }.
 * Rows whose status is set must be an accepted "ready" value.
 */
export function parsePlanJson(text: string): ParsedRow[] {
  const data = JSON.parse(text) as unknown;
  const arr = Array.isArray(data) ? data : [data];
  const out: ParsedRow[] = [];
  for (const item of arr as Record<string, unknown>[]) {
    if (!item || typeof item !== "object") continue;
    const clips = item.clips;
    if (!Array.isArray(clips) || !clips.length) continue;
    const ok = clips.every(
      (c) =>
        !!c &&
        typeof (c as { start?: unknown }).start === "number",
    );
    if (!ok) continue;
    const status = String(item.status ?? "").trim();
    if (status && !isTodo(status)) continue;
    out.push(
      makeRow(
        String(item.date ?? ""),
        String(item.title ?? ""),
        String(item.imdb_id ?? item.imdb ?? ""),
        String(item.script ?? ""),
        clips as ExplainerClip[],
        status,
      ),
    );
  }
  return out;
}

export type SheetDiag = {
  headerFound: boolean;
  clipsHeader: string;
  progressHeader: string;
  totalDataRows: number;
  validClipRows: number;
  todoRows: number;
  progressValues: string[];
};

export function diagnoseSheet(text: string): SheetDiag {
  const rows = parseCsvRows(text);
  const empty: SheetDiag = {
    headerFound: false,
    clipsHeader: "",
    progressHeader: "",
    totalDataRows: 0,
    validClipRows: 0,
    todoRows: 0,
    progressValues: [],
  };
  if (!rows.length) return empty;
  const col = headerMap(rows[0]);
  if (col.clips < 0 || col.script < 0) return empty;
  const diag: SheetDiag = {
    headerFound: true,
    clipsHeader: (rows[0][col.clips] ?? "").trim(),
    progressHeader: col.progress >= 0 ? (rows[0][col.progress] ?? "").trim() : "",
    totalDataRows: 0,
    validClipRows: 0,
    todoRows: 0,
    progressValues: [],
  };
  for (const r of rows.slice(1)) {
    if (!(r[col.clips] ?? "").trim().startsWith("[")) continue;
    diag.totalDataRows++;
    const parsed = buildRow(r, col);
    if (!parsed) continue;
    diag.validClipRows++;
    if (col.progress >= 0) {
      diag.progressValues.push(parsed.progress);
      if (isTodo(parsed.progress)) diag.todoRows++;
    }
  }
  return diag;
}

/**
 * Header-aware CSV/TSV: when a header row with a clip-plan column exists, only rows whose
 * Progress/Status column is an accepted "ready" value are returned. Falls back to positional
 * parsing for raw single-row pastes without headers.
 */
export function parseAllRows(text: string, onlyTodo = true): ParsedRow[] {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return parsePlanJson(text);
  const rows = parseCsvRows(text);
  if (!rows.length) return [];
  const col = headerMap(rows[0]);
  if (col.clips >= 0 && col.script >= 0) {
    const out: ParsedRow[] = [];
    for (const r of rows.slice(1)) {
      const raw = (r[col.clips] ?? "").trim();
      if (!raw.startsWith("[")) continue;
      const parsed = buildRow(r, col);
      if (!parsed) continue;
      if (onlyTodo && col.progress >= 0 && !isTodo(parsed.progress)) continue;
      out.push(parsed);
    }
    return out;
  }
  const out: ParsedRow[] = [];
  for (const r of rows) {
    const jsonIdx = r.findIndex((f) => f.trim().startsWith("["));
    if (jsonIdx < 3 || /^date/i.test(r[0])) continue;
    const parsed = buildRow(r, {
      date: 0,
      title: jsonIdx - 3,
      imdb: jsonIdx - 2,
      script: jsonIdx - 1,
      clips: jsonIdx,
      est: jsonIdx + 1,
      progress: jsonIdx + 2,
    });
    if (parsed) out.push(parsed);
  }
  return out;
}

export function parseProductionRow(text: string): ParsedRow {
  const rows = parseAllRows(text, false);
  if (!rows.length)
    throw new Error(
      "No valid production row found — expected columns: Date, Movie Title & TMDB ID, IMDb ID, Voiceover Script, Clip Timestamp Plan (JSON), Est Duration, Progress",
    );
  return rows[0];
}
