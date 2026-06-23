import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Plus,
  Info,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  Star,
  Volume2,
  Clock,
  Calendar,
  X,
} from "lucide-react";
import { tmdbApi, IMG_URL, type TMDBItem } from "@/lib/tmdb";
import heroFallback from "@/assets/hero-astronaut.jpg";
import w1 from "@/assets/wide-1.jpg";

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

/* ─── NAV ─── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults } = useQuery({
    queryKey: ["search", query],
    queryFn: () => tmdbApi.search(query),
    enabled: query.length > 1,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  const results =
    searchResults?.results?.filter((r) => r.media_type !== "person" && r.poster_path) ?? [];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "backdrop-blur-xl bg-background/70 border-b border-border" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-baseline gap-1 font-display text-2xl font-bold tracking-tight">
              ORBIT<sup className="text-[10px] font-normal text-muted-foreground">®</sup>
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
              {["Home", "Films", "Series", "Anime", "My List"].map((l, i) => (
                <a
                  key={l}
                  href="#"
                  className={`transition-colors hover:text-foreground ${i === 0 ? "text-foreground" : ""}`}
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden h-8 w-px bg-border md:block" />
            <button className="hidden rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-primary-foreground md:block">
              Subscribe
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-ice to-accent ring-2 ring-border" />
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-2xl">
          <div className="flex items-center gap-4 border-b border-border px-6 py-5 md:px-10">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, series, anime..."
              className="flex-1 bg-transparent text-xl outline-none placeholder:text-muted-foreground"
            />
            <button onClick={() => { setSearchOpen(false); setQuery(""); }}>
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
            {query.length > 1 && results.length === 0 && (
              <p className="text-muted-foreground">No results for "{query}"</p>
            )}
            {results.length > 0 && (
              <>
                <p className="mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {results.length} results
                </p>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {results.map((item) => {
                    const type = item.media_type === "tv" ? "tv" : "movie";
                    return (
                      <SearchResultCard
                        key={item.id}
                        item={item}
                        type={type}
                        onSelect={() => { setSearchOpen(false); setQuery(""); }}
                      />
                    );
                  })}
                </div>
              </>
            )}
            {query.length <= 1 && (
              <p className="text-muted-foreground">Start typing to search…</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SearchResultCard({
  item,
  type,
  onSelect,
}: {
  item: TMDBItem;
  type: "movie" | "tv";
  onSelect: () => void;
}) {
  const to = type === "movie" ? "/movie/$movieId" : "/tv/$tvId";
  const params = type === "movie" ? { movieId: String(item.id) } : { tvId: String(item.id) };
  return (
    <Link to={to} params={params} onClick={onSelect} className="group block">
      <div className="aspect-[2/3] overflow-hidden rounded-md border border-border bg-surface">
        <img
          src={IMG_URL(item.poster_path, "w300")}
          alt={item.title || item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <p className="mt-2 text-xs font-medium leading-tight truncate">{item.title || item.name}</p>
    </Link>
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

      <div className="relative z-10 mx-auto grid h-screen max-w-[1600px] grid-cols-12 gap-6 px-6 pb-16 pt-32 md:px-10 md:pt-36">
        <div className="col-span-12 flex flex-col justify-between md:col-span-5">
          <div>
            <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-ice/60" />
              <span>Featured · {mediaType === "tv" ? "Series" : "Original Film"}</span>
            </div>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-[5.5rem]">
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

      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
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
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur-md">
            <Plus className="h-3.5 w-3.5" />
          </div>
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
          {["AWARD WINNING", "ORIGINALS", "4K · HDR · ATMOS", "NO ADS", "OFFLINE", "GLOBAL CATALOGUE"].map((s) => (
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
    <section className="relative py-24">
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
              <span className="h-px w-8 bg-ice/60" /> Editor's Note
            </div>
            <h3 className="font-display text-2xl font-semibold leading-snug">Expand your horizons.</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Become part of the story. Drift through star systems, follow detectives through moonlit alleys, and watch animation built for the late hours. Our editors curate every collection by hand.
            </p>
            <a href="#" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground">
              Read more <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Stat label="Titles" value="12,400+" />
            <Stat label="Originals" value="320" icon={<Star className="h-3 w-3 fill-ice text-ice" />} />
            <Stat label="Runtime" value="∞" icon={<Clock className="h-3 w-3" />} />
            <Stat label="Updated" value="Weekly" icon={<Calendar className="h-3 w-3" />} />
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

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="relative mt-20 border-t border-border bg-surface/30 pb-10 pt-20">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-6">
            <div className="flex items-baseline gap-1 font-display text-3xl font-bold tracking-tight">
              ORBIT<sup className="text-xs font-normal text-muted-foreground">®</sup>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              A cinematic streaming service for film, series and anime. Built for the dark hours, designed for the screen.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <input
                placeholder="your@email.com"
                className="w-64 rounded-full border border-border bg-background px-5 py-3 text-sm placeholder:text-muted-foreground focus:border-ice focus:outline-none"
              />
              <button className="rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
                Start Free Trial
              </button>
            </div>
          </div>

          {[
            { h: "Browse", l: ["Films", "Series", "Anime", "Documentaries", "New & Popular"] },
            { h: "Account", l: ["Profile", "My List", "Devices", "Subscription"] },
            { h: "Studio", l: ["About", "Press", "Careers", "Contact"] },
          ].map((c) => (
            <div key={c.h} className="col-span-6 md:col-span-2">
              <div className="mb-5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{c.h}</div>
              <ul className="space-y-3 text-sm">
                {c.l.map((i) => (
                  <li key={i}>
                    <a href="#" className="text-foreground/80 transition-colors hover:text-ice">{i}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Orbit Pictures · All rights reserved</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
