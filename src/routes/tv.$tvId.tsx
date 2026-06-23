import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Star, Clock, Calendar, Tv, ChevronDown } from "lucide-react";
import { tmdbApi, IMG_URL, type TMDBItem } from "@/lib/tmdb";
import { Nav } from "@/components/site/Nav";

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

  const seasons = show?.seasons?.filter((s) => s.season_number > 0) ?? [];
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => { setSelectedEpisode(1); }, [selectedSeason]);

  useEffect(() => {
    if (show?.name) document.title = `${show.name} — ORBIT`;
    return () => { document.title = "ORBIT"; };
  }, [show?.name]);

  if (isLoading) return <LoadingScreen />;
  if (!show) return <ErrorScreen />;

  const backdrop = IMG_URL(show.backdrop_path, "original");
  const poster = IMG_URL(show.poster_path, "w342");
  const year = show.first_air_date?.slice(0, 4) ?? "";
  const runtime = show.episode_run_time?.[0] ? `~${show.episode_run_time[0]}m / ep` : "";
  const cast = show.credits?.cast?.slice(0, 8) ?? [];
  const similar = show.similar?.results?.filter((m) => m.poster_path).slice(0, 12) ?? [];
  const currentSeason = seasons.find((s) => s.season_number === selectedSeason);
  const episodeCount = currentSeason?.episode_count ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className="pt-[73px]">
        {/* Player row: player left, episode list right */}
        <div className="px-6 pt-6 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">

            {/* Player */}
            <div>
              <div className="overflow-hidden rounded-xl bg-black">
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                  <iframe
                    key={`${id}-${selectedSeason}-${selectedEpisode}`}
                    src={`https://player.videasy.net/tv/${id}/${selectedSeason}/${selectedEpisode}?color=6366f1&nextEpisode=true&autoplayNextEpisode=true&overlay=true`}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                    frameBorder="0"
                    allowFullScreen
                    allow="encrypted-media autoplay fullscreen"
                  />
                </div>
              </div>
            </div>

            {/* Episode list */}
            {seasons.length > 0 && (
              <div className="flex flex-col rounded-xl border border-border bg-surface/40 overflow-hidden">
                {/* Season selector header */}
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <div className="relative flex-1">
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pr-7 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ice cursor-pointer"
                    >
                      {seasons.map((s) => (
                        <option key={s.id} value={s.season_number}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">{episodeCount} eps</span>
                </div>

                {/* Episode buttons — scrollable */}
                <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
                  {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
                    <button
                      key={ep}
                      onClick={() => setSelectedEpisode(ep)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-0 ${
                        selectedEpisode === ep
                          ? "bg-ice/10 text-ice"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      }`}
                    >
                      <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        selectedEpisode === ep ? "bg-ice text-background" : "bg-border/60"
                      }`}>
                        {ep}
                      </span>
                      <span className="text-sm">Episode {ep}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details below */}
        <div className="px-4 py-8 md:px-10">
          <div className="flex gap-6">
            {poster && (
              <img
                src={poster}
                alt={show.name}
                className="hidden h-[160px] w-[107px] flex-shrink-0 rounded-lg border border-border object-cover shadow-lg sm:block"
              />
            )}
            <div className="flex-1">
              {show.tagline && (
                <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{show.tagline}</p>
              )}
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                {show.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {year && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{year}</span>}
                {runtime && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{runtime}</span>}
                {show.number_of_seasons > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5" />{show.number_of_seasons} Season{show.number_of_seasons > 1 ? "s" : ""}
                  </span>
                )}
                {show.vote_average > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <Star className="h-3.5 w-3.5 fill-current" />{show.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {show.genres?.map((g) => (
                  <span key={g.id} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
                    {g.name}
                  </span>
                ))}
              </div>
              {show.overview && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{show.overview}</p>
              )}
            </div>
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <section className="mt-10">
              <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Cast</p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
                {cast.map((member) => (
                  <div key={member.id} className="text-center">
                    <div className="mx-auto mb-2 h-14 w-14 overflow-hidden rounded-full border border-border bg-surface">
                      {member.profile_path ? (
                        <img src={IMG_URL(member.profile_path, "w185")} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg text-muted-foreground">{member.name[0]}</div>
                      )}
                    </div>
                    <p className="text-[11px] font-medium leading-tight">{member.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight line-clamp-1">{member.character}</p>
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
                  <SimilarCard key={m.id} item={m} type="tv" />
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
      <Tv className="h-10 w-10 animate-pulse text-muted-foreground" />
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
