import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Star, Clock, Calendar, ExternalLink, Film, PlayCircle } from "lucide-react";
import { tmdbApi, IMG_URL, type TMDBItem } from "@/lib/tmdb";
import { Nav } from "@/components/site/Nav";

export const Route = createFileRoute("/movie/$movieId")({
  component: MoviePage,
});

const WATCH_PROVIDERS = [
  { name: "Netflix", icon: "🎬" },
  { name: "Amazon Prime Video", icon: "📦" },
  { name: "Disney+", icon: "✨" },
  { name: "Apple TV+", icon: "🍎" },
  { name: "HBO Max", icon: "📺" },
  { name: "Hulu", icon: "🟢" },
  { name: "Peacock", icon: "🦚" },
  { name: "Paramount+", icon: "⛰️" },
];

function MoviePage() {
  const { movieId } = Route.useParams();
  const id = Number(movieId);

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
  const poster = IMG_URL(movie.poster_path, "w500");
  const year = movie.release_date?.slice(0, 4) ?? "";
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "";
  const cast = movie.credits?.cast?.slice(0, 8) ?? [];
  const similar = movie.similar?.results?.filter((m) => m.poster_path).slice(0, 12) ?? [];
  const justWatchUrl = `https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.title ?? "")}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Backdrop hero */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {backdrop && (
          <>
            <img src={backdrop} alt="" className="h-full w-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
          </>
        )}
      </div>

      {/* Main content */}
      <div className="relative -mt-48 px-6 pb-16 md:px-16 lg:px-24">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          {/* Poster */}
          {poster && (
            <img
              src={poster}
              alt={movie.title}
              className="w-[160px] flex-shrink-0 self-start rounded-xl border border-border object-cover shadow-2xl sm:w-[200px]"
            />
          )}

          {/* Info */}
          <div className="flex-1 pt-2">
            {movie.tagline && (
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">{movie.tagline}</p>
            )}
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              {movie.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
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
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{movie.overview}</p>
            )}

            <a
              href={`https://www.themoviedb.org/movie/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              <Film className="h-4 w-4" />
              View on TMDB
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* Where to Watch */}
        <section className="mt-14">
          <div className="mb-2 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display text-xl font-semibold">Where to Watch</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Find <span className="font-medium text-foreground">"{movie.title}"</span> on your streaming platforms:
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {WATCH_PROVIDERS.map((p) => (
              <a
                key={p.name}
                href={justWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 transition-all hover:border-white/20 hover:bg-surface/80"
              >
                <span className="text-xl">{p.icon}</span>
                <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{p.name}</span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-40" />
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Links open JustWatch — shows which platforms carry this title in your region.
          </p>
        </section>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-14">
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
      <Film className="h-10 w-10 animate-pulse text-muted-foreground" />
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
