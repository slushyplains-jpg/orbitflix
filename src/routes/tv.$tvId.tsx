import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Clock, Calendar, Tv } from "lucide-react";
import { tmdbApi, IMG_URL, type TMDBItem } from "@/lib/tmdb";

export const Route = createFileRoute("/tv/$tvId")({
  component: TVPage,
});

function TVPage() {
  const { tvId } = Route.useParams();
  const id = Number(tvId);

  const { data: show, isLoading } = useQuery({
    queryKey: ["tv", id],
    queryFn: () => tmdbApi.tvDetail(id),
  });

  if (isLoading) return <LoadingScreen />;
  if (!show) return <ErrorScreen />;

  const backdrop = IMG_URL(show.backdrop_path, "original");
  const poster = IMG_URL(show.poster_path, "w342");
  const year = show.first_air_date?.slice(0, 4) ?? "";
  const runtime = show.episode_run_time?.[0] ? `~${show.episode_run_time[0]}m / ep` : "";
  const cast = show.credits?.cast?.slice(0, 8) ?? [];
  const similar = show.similar?.results?.filter((m) => m.poster_path).slice(0, 12) ?? [];
  const seasons = show.seasons?.filter((s) => s.season_number > 0) ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-center gap-4 px-6 py-5 backdrop-blur-xl bg-background/60 border-b border-border">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="font-display text-lg font-bold tracking-tight">
          ORBIT<sup className="text-[9px] font-normal text-muted-foreground">®</sup>
        </span>
      </div>

      {/* Player — Videasy handles episode navigation internally */}
      <div className="pt-[60px]">
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
          <iframe
            src={`https://player.videasy.net/tv/${id}/1/1?color=6366f1&episodeSelector=true&nextEpisode=true&autoplayNextEpisode=true&overlay=true`}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            frameBorder="0"
            allowFullScreen
            allow="encrypted-media autoplay fullscreen"
          />
        </div>
      </div>

      {/* Details */}
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          {poster && (
            <img
              src={poster}
              alt={show.name}
              className="w-full max-w-[200px] rounded-lg border border-border object-cover self-start flex-shrink-0"
            />
          )}

          {/* Info */}
          <div className="flex-1">
            {show.tagline && (
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">{show.tagline}</p>
            )}
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              {show.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {year && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{year}</span>}
              {runtime && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{runtime}</span>}
              {show.number_of_seasons > 0 && (
                <span className="flex items-center gap-1.5">
                  <Tv className="h-3.5 w-3.5" />{show.number_of_seasons} Season{show.number_of_seasons > 1 ? "s" : ""}
                </span>
              )}
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {show.vote_average.toFixed(1)}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {show.genres?.map((g) => (
                <span key={g.id} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
                  {g.name}
                </span>
              ))}
            </div>

            {show.overview && (
              <p className="mt-6 leading-relaxed text-muted-foreground">{show.overview}</p>
            )}

            {/* Seasons info */}
            {seasons.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Seasons</p>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((s) => (
                    <div key={s.id} className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-muted-foreground">{s.episode_count} episodes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop */}
        {backdrop && (
          <div className="mt-10 overflow-hidden rounded-xl border border-border">
            <img src={backdrop} alt="" className="w-full object-cover opacity-60" />
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 font-display text-2xl font-semibold">Cast</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
              {cast.map((member) => (
                <div key={member.id} className="text-center">
                  <div className="mx-auto mb-2 h-16 w-16 overflow-hidden rounded-full border border-border bg-surface">
                    {member.profile_path ? (
                      <img src={IMG_URL(member.profile_path, "w185")} alt={member.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl text-muted-foreground">
                        {member.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium leading-tight">{member.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{member.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-semibold">More Like This</h2>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {similar.map((m) => (
                <SimilarCard key={m.id} item={m} type="tv" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SimilarCard({ item, type }: { item: TMDBItem; type: "movie" | "tv" }) {
  const to = type === "movie" ? "/movie/$movieId" : "/tv/$tvId";
  const params = type === "movie" ? { movieId: String(item.id) } : { tvId: String(item.id) };
  return (
    // @ts-expect-error dynamic params
    <Link to={to} params={params} className="group block">
      <div className="overflow-hidden rounded-md border border-border bg-surface aspect-[2/3]">
        {item.poster_path ? (
          <img
            src={IMG_URL(item.poster_path, "w300")}
            alt={item.title || item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
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
      <div className="flex flex-col items-center gap-4">
        <Tv className="h-10 w-10 animate-pulse text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function ErrorScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Could not load show.</p>
        <Link to="/" className="mt-4 inline-block text-sm underline">Go home</Link>
      </div>
    </div>
  );
}
