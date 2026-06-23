import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import {
  Play,
  Plus,
  Check,
  Info,
  ChevronRight,
  ChevronLeft,
  Star,
  Volume2,
  Clock,
  Calendar,
} from "lucide-react";
import { tmdbApi, IMG_URL, type TMDBItem } from "@/lib/tmdb";
import { useMyList } from "@/hooks/use-my-list";
import heroFallback from "@/assets/hero-astronaut.jpg";
import w1 from "@/assets/wide-1.jpg";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ORBIT — Cinematic Streaming for Film, Series & Anime" },
      {
        name: "description",
        content:
          "ORBIT is a cinematic streaming platform for films, series and anime. Discover boundless worlds, hand-curated catalogues, and exclusive originals.",
      },
      { property: "og:title", content: "ORBIT — Cinematic Streaming" },
      {
        property: "og:description",
        content: "Films, series and anime, curated like cinema.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: trending } = useQuery({ queryKey: ["trending"], queryFn: tmdbApi.trending });
  const { data: popularMovies } = useQuery({ queryKey: ["popularMovies"], queryFn: tmdbApi.popularMovies });
  const { data: popularTV } = useQuery({ queryKey: ["popularTV"], queryFn: tmdbApi.popularTV });
  const { data: actionMovies } = useQuery({ queryKey: ["actionMovies"], queryFn: tmdbApi.actionMovies });
  const { data: scifiMovies } = useQuery({ queryKey: ["scifiMovies"], queryFn: tmdbApi.scifiMovies });
  const { data: anime } = useQuery({ queryKey: ["animeTV"], queryFn: tmdbApi.animeTV });

  const featured = trending?.results?.find((i) => i.backdrop_path) ?? trending?.results?.[0];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero item={featured} />
      <RailSection
        title="Trending Now"
        subtitle="Most watched this cycle"
        items={trending?.results?.filter((i) => i.media_type !== "person") ?? []}
      />
      <SpotlightStrip />
      <RailSection
        title="Popular Films"
        subtitle="Top movies right now"
        items={popularMovies?.results ?? []}
        mediaType="movie"
      />
      <RailSection
        title="Popular Series"
        subtitle="Binge-worthy television"
        items={popularTV?.results ?? []}
        mediaType="tv"
      />
      <RailSection
        title="Anime · Selected"
        subtitle="From Tokyo to the cosmos"
        items={anime?.results ?? []}
        mediaType="tv"
      />
      <FeatureBlock item={popularMovies?.results?.[0]} />
      <RailSection
        title="Action & Adventure"
        subtitle="Edge-of-your-seat cinema"
        items={actionMovies?.results ?? []}
        mediaType="movie"
      />
      <RailSection
        title="Sci-Fi & Fantasy"
        subtitle="Boundless imagination"
        items={scifiMovies?.results ?? []}
        mediaType="movie"
      />
      <Footer />
    </div>
  );
}

/* ─── HERO ─── */
function Hero({ item }: { item?: TMDBItem }) {
  const backdropUrl = item?.backdrop_path ? IMG_URL(item.backdrop_path, "original") : heroFallback;
  const title = item?.title || item?.name || "Discover the wonders of cinema";
  const mediaType = item?.media_type === "tv" ? "tv" : "movie";
  const to = mediaType === "tv" ? "/tv/$tvId" : "/movie/$movieId";
  const params = mediaType === "tv" ? { tvId: String(item?.id) } : { movieId: String(item?.id) };
  const year = (item?.release_date || item?.first_air_date)?.slice(0, 4) ?? "";

  const words = title.split(" ");
  const firstPart = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const secondPart = words.slice(Math.ceil(words.length / 2)).join(" ");

  return (
    <section className="relative film-grain min-h-[100vh] w-full overflow-hidden">
      <img
        src={backdropUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-90 transition-opacity duration-700"
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-vignette)" }} />
      <div className="absolute inset-0" style={{ background: "var(--gradient-fade-bottom)" }} />
      <div className="absolute inset-0 hidden md:block" style={{ background: "var(--gradient-fade-right)" }} />

      <div className="pointer-events-none absolute inset-0 mx-auto hidden max-w-[1600px] md:block">
        {[20, 40, 60, 80].map((p) => (
          <div key={p} className="absolute top-0 h-full w-px bg-foreground/5" style={{ left: `${p}%` }} />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1600px] grid-cols-12 gap-6 px-6 pb-24 pt-28 md:h-screen md:pb-16 md:px-10 md:pt-36">
        <div className="col-span-12 flex flex-col justify-between md:col-span-5">
          <div>
            <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-ice/60" />
              <span>Featured · {mediaType === "tv" ? "Series" : "Original Film"}</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl md:text-7xl lg:text-[5.5rem]">
              {firstPart}<br />
              <span className="text-ice text-glow">{secondPart}</span>
            </h1>
            {item?.overview && (
              <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {item.overview}
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link to={to} params={params} className="group inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
              <Play className="h-4 w-4 fill-current" /> Watch Now
            </Link>
            <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-6 py-3.5 text-sm font-medium backdrop-blur-md transition-colors hover:bg-surface">
              <Plus className="h-4 w-4" /> My List
            </button>
            <Link to={to} params={params} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 p-3.5 backdrop-blur-md transition-colors hover:bg-surface">
              <Info className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="col-span-12 hidden flex-col justify-between md:col-span-4 md:col-start-9 md:flex">
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
              Explore<br />the Vastness<br />of Story
            </h2>
            <p className="mt-6 max-w-xs text-[11px] uppercase leading-relaxed tracking-[0.15em] text-muted-foreground">
              Welcome to a curated universe of film and animation. Every title hand-picked, every frame composed for the night.
            </p>
          </div>
          <div className="mt-12 flex items-end justify-between">
            <div>
              <div className="font-display text-5xl font-semibold leading-none md:text-6xl">
                Now<br />Streaming
                <span className="ml-2 align-top text-base text-muted-foreground">/24</span>
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Worldwide · 4K HDR
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 hidden -translate-x-1/2 md:block">
        <button className="group flex h-28 w-28 animate-float-slow flex-col items-center justify-center rounded-full border border-border bg-background/30 text-xs uppercase tracking-[0.2em] text-foreground backdrop-blur-md transition-all hover:border-ice hover:bg-background/60">
          Discover
          <ChevronRight className="mt-1 h-3 w-3 rotate-90" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-border bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs uppercase tracking-[0.2em] text-muted-foreground md:px-10">
          <div className="flex items-center gap-6">
            {item?.vote_average ? (
              <span className="flex items-center gap-2">
                <Star className="h-3 w-3 fill-ice text-ice" /> {item.vote_average.toFixed(1)} / 10
              </span>
            ) : null}
            {year && <span className="hidden md:inline">{year}</span>}
            <span className="hidden md:inline">{mediaType === "tv" ? "Series" : "Film"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Volume2 className="h-3 w-3" />
            <span>Atmos · 4K Dolby Vision</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── RAIL ─── */
function RailSection({
  title,
  subtitle,
  items,
  mediaType,
}: {
  title: string;
  subtitle: string;
  items: TMDBItem[];
  mediaType?: "movie" | "tv";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  if (!items.length) {
    return (
      <section className="relative py-20">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <SkeletonRail title={title} subtitle={subtitle} />
        </div>
      </section>
    );
  }

  const filtered = items.filter((i) => i.poster_path);

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-ice/60" />
              {subtitle}
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={() => scroll(-1)} className="rounded-full border border-border p-3 transition-colors hover:bg-surface">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll(1)} className="rounded-full border border-border p-3 transition-colors hover:bg-surface">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={ref}
          className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-10 md:px-10"
        >
          {filtered.map((item, i) => (
            <PosterCard key={item.id} item={item} index={i + 1} mediaType={mediaType} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PosterCard({
  item,
  index,
  mediaType,
}: {
  item: TMDBItem;
  index: number;
  mediaType?: "movie" | "tv";
}) {
  const type = mediaType ?? (item.media_type === "tv" ? "tv" : "movie");
  const to = type === "tv" ? "/tv/$tvId" : "/movie/$movieId";
  const params = type === "tv" ? { tvId: String(item.id) } : { movieId: String(item.id) };
  const title = item.title || item.name || "";
  const year = (item.release_date || item.first_air_date)?.slice(0, 4) ?? "";
  const tag = type === "tv" ? "SERIES" : "FILM";
  const { add, remove, isInList } = useMyList();
  const inList = isInList(item.id, type);

  function handleListToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inList) {
      remove(item.id, type);
    } else {
      add({ id: item.id, type, title, poster_path: item.poster_path ?? null });
    }
  }

  return (
    <Link
      to={to}
      params={params}
      className="group relative aspect-[2/3] w-[220px] flex-shrink-0 snap-start overflow-hidden rounded-md border border-border bg-surface md:w-[260px] block"
    >
      <img
        src={IMG_URL(item.poster_path, "w500")}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />

      <div className="absolute left-3 top-3 font-display text-xs font-medium tracking-widest text-muted-foreground">
        {String(index).padStart(2, "0")}
      </div>

      <div className="absolute right-3 top-3 rounded-sm border border-border bg-background/60 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-ice backdrop-blur-md">
        {tag}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>{year}</span>
        </div>
        <h3 className="font-display text-xl font-semibold leading-tight line-clamp-2">{title}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-ice text-ice" /> {item.vote_average?.toFixed(1) ?? "—"}
        </div>

        <div className="mt-4 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-primary-foreground">
            <Play className="h-3.5 w-3.5 fill-current" />
          </div>
          <button
            onClick={handleListToggle}
            className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
              inList
                ? "border-ice bg-ice/20 text-ice"
                : "border-border bg-background/60 text-foreground hover:border-ice hover:text-ice"
            }`}
          >
            {inList ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </Link>
  );
}

function SkeletonRail({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-px w-8 bg-ice/60" />{subtitle}
        </div>
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
      </div>
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] w-[220px] flex-shrink-0 rounded-md bg-surface animate-pulse md:w-[260px]"
          />
        ))}
      </div>
    </>
  );
}

/* ─── SPOTLIGHT STRIP ─── */
function SpotlightStrip() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface/30 py-12">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          {["WARNER BROS", "MARVEL STUDIOS", "A24 · NEON · MUBI", "NETFLIX", "HBO · MAX", "DISNEY · PIXAR"].map((s) => (
            <span key={s} className="font-display text-xl font-medium tracking-tight text-muted-foreground md:text-3xl">
              {s} <span className="text-ice">+</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURE BLOCK ─── */
function FeatureBlock({ item }: { item?: TMDBItem }) {
  const backdrop = item?.backdrop_path ? IMG_URL(item.backdrop_path, "w1280") : w1;
  const title = item?.title || item?.name || "";
  const type = item?.media_type === "tv" ? "tv" : "movie";
  const to = type === "tv" ? "/tv/$tvId" : "/movie/$movieId";
  const params = type === "tv" ? { tvId: String(item?.id) } : { movieId: String(item?.id) };

  return (
    <section className="relative py-12 md:py-24">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-6 px-6 md:px-10">
        <div className="col-span-12 md:col-span-7">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border film-grain">
            <img src={backdrop} alt={title} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
              <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-ice">Featured</div>
              <h3 className="font-display text-3xl font-semibold leading-tight md:text-5xl">{title}</h3>
              {item?.overview && (
                <p className="mt-3 max-w-md text-sm text-muted-foreground line-clamp-2">{item.overview}</p>
              )}
              {item && (
                <Link to={to} params={params} className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
                  <Play className="h-3 w-3 fill-current" /> Watch Now
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-6 md:col-span-5">
          <div className="rounded-lg border border-border bg-surface p-8">
            <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-ice/60" /> Curator's Pick
            </div>
            <h3 className="font-display text-2xl font-semibold leading-snug">Where every frame matters.</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              From Sundance breakouts to blockbuster franchises. Stream the latest from A24, Warner Bros, Marvel, HBO, and more — handpicked by our editorial team every week.
            </p>
            <a href="#" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground">
              Explore picks <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Stat label="Studios" value="50+" />
            <Stat label="Awards" value="2,100+" icon={<Star className="h-3 w-3 fill-ice text-ice" />} />
            <Stat label="Countries" value="190+" icon={<Clock className="h-3 w-3" />} />
            <Stat label="Updated" value="Daily" icon={<Calendar className="h-3 w-3" />} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}

