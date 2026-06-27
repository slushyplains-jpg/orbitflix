import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Star, Clock, Calendar, Play, ServerCrash } from "lucide-react";
import { tmdbApi, IMG_URL, type TMDBItem } from "@/lib/tmdb";
import { Nav } from "@/components/site/Nav";

type Server = "videasy" | "vidsrc";
const SERVERS: { id: Server; label: string }[] = [
  { id: "videasy", label: "Server 1" },
  { id: "vidsrc", label: "Server 2" },
];

export const Route = createFileRoute("/movie/$movieId")({
  component: MoviePage,
});

function MoviePage() {
  const { movieId } = Route.useParams();
  const id = Number(movieId);
  const [server, setServer] = useState<Server>("videasy");

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => tmdbApi.movieDetail(id),
  });

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

  const playerSrc = server === "vidsrc"
    ? `https://vidsrc.mov/embed/movie/${id}`
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
                key={server}
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
