import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Star, Clock, Calendar, Play, ServerCrash, Quote, X, Users, Copy, Check } from "lucide-react";
import { tmdbApi, IMG_URL, type TMDBItem, type TMDBReview } from "@/lib/tmdb";
import { Nav } from "@/components/site/Nav";
import { useRoom, IDX_SERVER } from "@/contexts/RoomContext";

// Commands the cloudorchestranova inner player accepts: { player: true, action: ... }
// Seek format: "seek" + seconds (absolute), e.g. "seek42.5"
// The relay chain (our page → vsembed → cloudorchestranova outer → inner player) forwards these.
function sendPlayerCmd(iframe: HTMLIFrameElement | null, event: string, time: number) {
  if (!iframe) return;
  let action: string;
  if (event === "play") action = "play";
  else if (event === "pause") action = "pause";
  else if (event === "seeked") action = `seek${time}`;
  else return;
  iframe.contentWindow?.postMessage({ player: true, action }, "*");
}

type Server = "videasy" | "vidsrc" | "clean";
const SERVERS: { id: Server; label: string }[] = [
  { id: "videasy", label: "Server 1" },
  { id: "vidsrc", label: "Server 2" },
  { id: "clean", label: "Server 3" },
];

export const Route = createFileRoute("/movie/$movieId")({
  component: MoviePage,
});

function MoviePage() {
  const { movieId } = Route.useParams();
  const id = Number(movieId);
  const { activeRoom, server, setServer, joinRoom, leaveRoom, copyRoomCode, copied, broadcastMovieChange, sendVideoEvent, registerRoomCmdHandler } = useRoom();

  const [roomOpen, setRoomOpen] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const mountedIdRef = useRef(id);
  const prevIdRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Read room + server from URL on first load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoom = urlParams.get("room")?.toUpperCase();
    const urlServer = IDX_SERVER[urlParams.get("server") ?? ""];
    if (urlRoom) {
      joinRoom(urlRoom, urlServer ?? undefined);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Broadcast movie change to room when navigating to a new movie
  useEffect(() => {
    if (prevIdRef.current !== null && prevIdRef.current !== id && activeRoom) {
      // Movie changed while in a room — broadcast after movie data loads
      // We'll broadcast once movie title is available (see below)
    }
    prevIdRef.current = id;
    setRoomOpen(false);
    setRoomInput("");
  }, [id]);

  // Native (no-extension) sync for Server 3 via PLAYER_EVENT postMessages
  useEffect(() => {
    if (server !== "clean" || !activeRoom) {
      registerRoomCmdHandler(null);
      return;
    }

    // Send video events to room WS
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "PLAYER_EVENT") return;
      const { player_status, player_progress } = e.data.data ?? {};
      if (player_status === "playing") sendVideoEvent("play", player_progress ?? 0);
      else if (player_status === "paused") sendVideoEvent("pause", player_progress ?? 0);
      else if (player_status === "seeked") sendVideoEvent("seeked", player_progress ?? 0);
    };
    window.addEventListener("message", handler);

    // Receive sync commands and control the iframe player
    registerRoomCmdHandler((event, time) => {
      sendPlayerCmd(iframeRef.current, event, time);
    });

    return () => {
      window.removeEventListener("message", handler);
      registerRoomCmdHandler(null);
    };
  }, [server, activeRoom, sendVideoEvent, registerRoomCmdHandler]);

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => tmdbApi.movieDetail(id),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["movieReviews", id],
    queryFn: () => tmdbApi.movieReviews(id),
  });

  // Broadcast movie change once title is known
  const hasBroadcast = useRef(false);
  useEffect(() => {
    if (!movie?.title || !activeRoom) return;
    if (hasBroadcast.current) return;
    hasBroadcast.current = true;
    broadcastMovieChange(id, movie.title, server);
  }, [movie?.title, activeRoom]);

  // Reset broadcast flag when movie changes
  useEffect(() => {
    hasBroadcast.current = false;
  }, [id]);

  useEffect(() => {
    if (movie?.title) document.title = `${movie.title} — ORBIT`;
    return () => { document.title = "ORBIT"; };
  }, [movie?.title]);

  if (isLoading) return <LoadingScreen />;
  if (!movie) return <ErrorScreen />;

  const backdrop = IMG_URL(movie.backdrop_path, "original");
  const poster = IMG_URL(movie.poster_path, "w342");
  const year = movie.release_date?.slice(0, 4) ?? "";
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "";
  const cast = movie.credits?.cast?.slice(0, 8) ?? [];
  const similar = movie.similar?.results?.filter((m) => m.poster_path).slice(0, 12) ?? [];
  const reviews = reviewsData?.results ?? [];

  const playerSrc = server === "vidsrc"
    ? `https://vidsrc.mov/embed/movie/${id}`
    : server === "clean"
    ? `https://vsembed.ru/embed/movie/${id}/`
    : `https://player.videasy.net/movie/${id}?color=6366f1&overlay=true`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className="pt-[73px]">
        {/* Player */}
        <div className="px-6 pt-6 md:px-16 lg:px-24">
          <div className="overflow-hidden rounded-xl bg-black">
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                key={playerSrc}
                ref={iframeRef}
                src={playerSrc}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                frameBorder="0"
                allowFullScreen
                allow="encrypted-media autoplay fullscreen"
              />
            </div>
          </div>

          {/* Server selector */}
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-surface/50 px-4 py-2.5">
            <ServerCrash className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Experiencing issues?</span>
            <div className="flex items-center gap-1.5 ml-auto">
              {SERVERS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServer(s.id)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    server === s.id
                      ? "bg-ice text-background"
                      : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Watch Together */}
          <div className="mt-2 relative">
            {activeRoom ? (
              <div className="flex items-center gap-3 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2.5">
                <Users className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                <span className="text-xs text-indigo-300">Room: <span className="font-mono font-semibold tracking-widest">{activeRoom}</span></span>
                <button onClick={() => copyRoomCode(id)} className="ml-auto flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-200 transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy code"}
                </button>
                <button onClick={leaveRoom} className="text-indigo-400 hover:text-indigo-200 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRoomOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors w-full"
              >
                <Users className="h-3.5 w-3.5" />
                Watch Together
              </button>
            )}

            {roomOpen && !activeRoom && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-border bg-background shadow-2xl p-4">
                <p className="text-sm font-medium mb-3">Watch Together</p>
                <div className="flex gap-2 mb-3">
                  <input
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === "Enter") { joinRoom(roomInput); setRoomOpen(false); } }}
                    placeholder="Enter room code"
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500"
                    maxLength={8}
                  />
                  <button
                    onClick={() => { joinRoom(roomInput); setRoomOpen(false); }}
                    disabled={!roomInput.trim()}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-4 py-2 text-sm font-medium text-white transition-colors"
                  >
                    Join
                  </button>
                </div>
                <button
                  onClick={() => { joinRoom(Math.random().toString(36).slice(2, 8).toUpperCase()); setRoomOpen(false); }}
                  className="w-full rounded-lg border border-border bg-surface/50 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create new room
                </button>
                <p className="mt-3 text-xs text-muted-foreground">Requires the Frame Sync browser extension.</p>
              </div>
            )}
          </div>
        </div>

        {/* Details below player */}
        <div className="px-4 py-10 md:px-10">
          <div className="flex gap-8">
            {poster && (
              <img
                src={poster}
                alt={movie.title}
                className="hidden h-[210px] w-[140px] flex-shrink-0 rounded-xl border border-border object-cover shadow-xl sm:block"
              />
            )}
            <div className="flex-1">
              {movie.tagline && (
                <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">{movie.tagline}</p>
              )}
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                {movie.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-5 text-base text-muted-foreground">
                {year && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{year}</span>}
                {runtime && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{runtime}</span>}
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />{movie.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {movie.genres?.map((g) => (
                  <span key={g.id} className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted-foreground">
                    {g.name}
                  </span>
                ))}
              </div>
              {movie.overview && (
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">{movie.overview}</p>
              )}
            </div>
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <section className="mt-12">
              <p className="mb-5 text-xs uppercase tracking-[0.25em] text-muted-foreground">Cast</p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
                {cast.map((member) => (
                  <div key={member.id} className="text-center">
                    <div className="mx-auto mb-2 h-16 w-16 overflow-hidden rounded-full border border-border bg-surface">
                      {member.profile_path ? (
                        <img src={IMG_URL(member.profile_path, "w185")} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg text-muted-foreground">{member.name[0]}</div>
                      )}
                    </div>
                    <p className="text-xs font-medium leading-tight">{member.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight line-clamp-1">{member.character}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Reviews marquee */}
        {reviews.length > 0 && <ReviewsMarquee reviews={reviews} />}

        {/* Similar */}
        {similar.length > 0 && (
          <div className="border-t border-border">
            <div className="px-4 py-12 md:px-10">
              <h2 className="mb-6 font-display text-2xl font-semibold">More Like This</h2>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {similar.map((m) => (
                  <SimilarCard key={m.id} item={m} type="movie" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SimilarCard({ item, type }: { item: TMDBItem; type: "movie" | "tv" }) {
  const to = type === "movie" ? "/movie/$movieId" : "/tv/$tvId";
  const params = type === "movie" ? { movieId: String(item.id) } : { tvId: String(item.id) };
  return (
    <Link to={to} params={params} className="group block">
      <div className="overflow-hidden rounded-md border border-border bg-surface aspect-[2/3]">
        {item.poster_path ? (
          <img src={IMG_URL(item.poster_path, "w300")} alt={item.title || item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground p-2 text-center">
            {item.title || item.name}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs font-medium leading-tight truncate">{item.title || item.name}</p>
    </Link>
  );
}

function formatReview(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")              // <br> → newline
    .replace(/<p[^>]*>/gi, "")                 // <p> open → nothing
    .replace(/<\/p>/gi, "\n\n")               // </p> → double newline
    .replace(/<\/?(em|i)>/gi, "")             // <em> <i> → strip
    .replace(/<\/?(strong|b)>/gi, "")         // <strong> <b> → strip
    .replace(/<[^>]+>/g, "")                   // any remaining tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/^#{1,6}\s+(.+)$/gm, "$1")        // # headers
    .replace(/\*\*(.+?)\*\*/g, "$1")            // **bold**
    .replace(/\*(.+?)\*/g, "$1")                // *italic*
    .replace(/__(.+?)__/g, "$1")               // __bold__
    .replace(/_(.+?)_/g, "$1")                  // _italic_
    .replace(/^[-*]{3,}$/gm, "")               // --- dividers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")   // [text](url)
    .replace(/^\s*[-*+]\s+/gm, "• ")           // list items
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type ReviewFilter = "all" | "positive" | "mixed" | "critical" | "unrated";

const REVIEW_FILTERS: { id: ReviewFilter; label: string; description: string }[] = [
  { id: "all",      label: "All",      description: "Every review" },
  { id: "positive", label: "Positive", description: "Rated 7–10" },
  { id: "mixed",    label: "Mixed",    description: "Rated 4–6" },
  { id: "critical", label: "Critical", description: "Rated 1–3" },
  { id: "unrated",  label: "No Rating", description: "No score given" },
];

function applyFilter(reviews: TMDBReview[], filter: ReviewFilter): TMDBReview[] {
  switch (filter) {
    case "positive": return reviews.filter((r) => r.author_details.rating != null && r.author_details.rating >= 7);
    case "mixed":    return reviews.filter((r) => r.author_details.rating != null && r.author_details.rating >= 4 && r.author_details.rating < 7);
    case "critical": return reviews.filter((r) => r.author_details.rating != null && r.author_details.rating < 4);
    case "unrated":  return reviews.filter((r) => r.author_details.rating == null);
    default:         return reviews;
  }
}

function ReviewsMarquee({ reviews }: { reviews: TMDBReview[] }) {
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<TMDBReview | null>(null);
  const [filter, setFilter] = useState<ReviewFilter>("all");

  const filtered = applyFilter(reviews, filter);
  const items = filtered.length > 0 ? [...filtered, ...filtered] : [];

  // Reset marquee position when filter changes by remounting the strip
  const stripKey = filter;

  return (
    <>
      <div className="border-t border-border py-12 overflow-hidden">
        <div className="px-4 mb-5 md:px-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Quote className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Audience Reviews</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {REVIEW_FILTERS.map((f) => {
              const count = f.id === "all" ? reviews.length : applyFilter(reviews, f.id).length;
              if (f.id !== "all" && count === 0) return null;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === f.id
                      ? "bg-ice text-background"
                      : "border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 ${filter === f.id ? "opacity-70" : "opacity-50"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <>
          {items.length === 0 ? (
            <p className="px-4 md:px-10 text-sm text-muted-foreground">No reviews in this category.</p>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
              <div
                key={stripKey}
                className="flex gap-4"
                style={{
                  animation: `marquee 70s linear infinite`,
                  animationPlayState: paused ? "paused" : "running",
                  width: "max-content",
                }}
              >
                {items.map((review, i) => (
                  <button
                    key={`${review.id}-${i}`}
                    onClick={() => setSelected(review)}
                    className="w-80 flex-shrink-0 rounded-xl border border-border bg-surface/50 p-5 text-left transition-colors hover:border-foreground/30 hover:bg-surface cursor-pointer"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ice/30 to-accent/30 text-sm font-bold text-foreground">
                        {review.author[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{review.author}</p>
                        {review.author_details.rating != null && (
                          <p className="flex items-center gap-1 text-[11px] text-yellow-400">
                            <Star className="h-3 w-3 fill-current" />
                            {review.author_details.rating}/10
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                      {formatReview(review.content)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </>
      </div>

      {/* Review modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-border/40 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ice/30 to-accent/30 text-base font-bold text-foreground">
                {selected.author[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-semibold">{selected.author}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {selected.author_details.rating != null && (
                    <p className="flex items-center gap-1 text-sm text-yellow-400">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {selected.author_details.rating}/10
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(selected.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto pr-1">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {formatReview(selected.content)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Play className="h-10 w-10 animate-pulse text-muted-foreground" />
    </div>
  );
}

function ErrorScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Could not load movie.</p>
        <Link to="/" className="mt-4 inline-block text-sm underline">Go home</Link>
      </div>
    </div>
  );
}
