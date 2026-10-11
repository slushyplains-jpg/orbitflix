import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface Props {
  tmdbId: number;
  // Called when play/pause/seek fires — for Watch Together sync
  onVideoEvent?: (event: "play" | "pause" | "seeked", time: number) => void;
  // Imperative handle so parent can control playback for room sync
  controlRef?: React.MutableRefObject<PlayerControl | null>;
}

export interface PlayerControl {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

type PlayerState = "idle" | "loading" | "ready" | "error";

const API_HEADERS = {
  Referer: "https://cloudorchestranova.com/embed/player/",
  Origin: "https://cloudorchestranova.com",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
};

// Fetch a token bound to the user's own IP from the CDN's generate.php endpoint.
// This token is then appended to all HLS requests so the CDN authenticates them.
async function getUserToken(cdnOrigin: string): Promise<string> {
  try {
    const res = await fetch(`${cdnOrigin}/generate.php`, {
      headers: {
        Referer: "https://cloudorchestranova.com/embed/player/movie/1",
        Origin: "https://cloudorchestranova.com",
      },
    });
    return res.ok ? (await res.text()).trim() : "";
  } catch {
    return "";
  }
}

function b64ToBytes(s: string): Uint8Array {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

async function decryptStreamUrls(
  wasmUrl: string,
  encB64: string
): Promise<string> {
  const res = await fetch(wasmUrl, { credentials: "omit" });
  const wasmBytes = await res.arrayBuffer();
  const mod = await WebAssembly.compile(wasmBytes);
  const inst = await (WebAssembly.instantiate(mod, {}) as Promise<WebAssembly.Instance>);
  const ex = inst.exports as {
    alloc: (n: number) => number;
    decrypt: (ptr: number, len: number) => number;
    memory: WebAssembly.Memory;
  };
  const enc = b64ToBytes(encB64);
  const ptr = ex.alloc(enc.length);
  new Uint8Array(ex.memory.buffer, ptr, enc.length).set(enc);
  const outLen = ex.decrypt(ptr, enc.length);
  return new TextDecoder().decode(new Uint8Array(ex.memory.buffer, ptr + 12, outLen));
}

async function fetchStreamUrls(tmdbId: number): Promise<string[]> {
  const url = `https://data.vidsrc.sh/api.php?type=movie&tmdb=${tmdbId}&stream_urls`;
  const res = await fetch(url, { headers: API_HEADERS });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  if (json.status_code !== "200") throw new Error("API returned non-200");

  const raw = json.data?.stream_urls;
  if (Array.isArray(raw)) return raw.filter(Boolean);

  // Encrypted — decrypt with WASM
  if (typeof raw === "string" && json.vs?.wasm_url) {
    const plain = await decryptStreamUrls(json.vs.wasm_url, raw);
    // plain is a single URL or newline-separated list
    return plain.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
  }

  throw new Error("No stream_urls in response");
}


export function NativeHLSPlayer({ tmdbId, onVideoEvent, controlRef }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayerState>("idle");
  const [streamUrls, setStreamUrls] = useState<string[]>([]);
  // Prevent echo-back of events we applied ourselves
  const suppressRef = useRef(false);

  // Expose imperative controls to parent (for room sync)
  useEffect(() => {
    if (!controlRef) return;
    controlRef.current = {
      play: () => {
        suppressRef.current = true;
        videoRef.current?.play().finally(() => {
          setTimeout(() => { suppressRef.current = false; }, 600);
        });
      },
      pause: () => {
        suppressRef.current = true;
        videoRef.current?.pause();
        setTimeout(() => { suppressRef.current = false; }, 600);
      },
      seek: (time: number) => {
        const v = videoRef.current;
        if (!v) return;
        suppressRef.current = true;
        v.currentTime = time;
        setTimeout(() => { suppressRef.current = false; }, 2000);
      },
    };
  }, [controlRef]);

  // Wire video events → room sync
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !onVideoEvent) return;
    const onPlay = () => { if (!suppressRef.current) onVideoEvent("play", v.currentTime); };
    const onPause = () => { if (!suppressRef.current) onVideoEvent("pause", v.currentTime); };
    const onSeeked = () => { if (!suppressRef.current) onVideoEvent("seeked", v.currentTime); };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("seeked", onSeeked);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("seeked", onSeeked);
    };
  }, [onVideoEvent]);

  // Load streams when tmdbId changes
  useEffect(() => {
    let cancelled = false;
    setState("loading");

    fetchStreamUrls(tmdbId).then((urls) => {
      if (cancelled) return;
      setStreamUrls(urls);
      setState(urls.length ? "ready" : "error");
    }).catch(() => {
      if (!cancelled) setState("error");
    });

    return () => { cancelled = true; };
  }, [tmdbId]);

  // Mount HLS when streams are ready
  useEffect(() => {
    if (state !== "ready" || !streamUrls.length || !videoRef.current) return;

    let cancelled = false;

    async function start(idx: number) {
      if (cancelled) return;
      const rawUrl = streamUrls[idx];
      if (!rawUrl) { setState("error"); return; }

      const video = videoRef.current!;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Get a token bound to the user's own IP so segments can be fetched directly
      const origin = (() => { try { return new URL(rawUrl).origin; } catch { return ""; } })();
      const token = origin ? await getUserToken(origin) : "";

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          // Use Fetch API so we can set referrerPolicy: "no-referrer".
          // CDN returns 200 when Referer is absent; 403 when it's a foreign domain.
          fetchSetup: (_context, initParams) => {
            const url = _context.url;
            const tokenized = token && !url.includes("token=")
              ? `${url}${url.includes("?") ? "&" : "?"}token=${token}`
              : url;
            return new Request(tokenized, { ...initParams, referrerPolicy: "no-referrer" });
          },
        });
        hlsRef.current = hls;
        hls.loadSource(rawUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal && idx + 1 < streamUrls.length) {
            start(idx + 1);
          } else if (data.fatal) {
            setState("error");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS — token in URL, referrerpolicy suppresses Referer header
        const safariUrl = token && !rawUrl.includes("token=")
          ? `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}token=${token}`
          : rawUrl;
        (video as HTMLVideoElement & { referrerPolicy?: string }).referrerPolicy = "no-referrer";
        video.src = safariUrl;
        video.onerror = () => {
          if (idx + 1 < streamUrls.length) start(idx + 1);
          else setState("error");
        };
      } else {
        setState("error");
      }
    }

    start(0);

    return () => {
      cancelled = true;
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [state, streamUrls]);

  if (state === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black text-sm text-white/60">
        <span>Stream unavailable</span>
        <button
          onClick={() => setState("loading")}
          className="rounded-md border border-white/20 px-4 py-1.5 text-xs hover:border-white/40 hover:text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      playsInline
      className="h-full w-full bg-black"
      style={{ display: "block" }}
    />
  );
}
