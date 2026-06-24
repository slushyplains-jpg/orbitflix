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
import { TelegramStrip } from "@/components/site/TelegramStrip";

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
      <TelegramStrip />
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

          {/* Telegram join + share — left column */}
          <div className="mt-6 flex flex-col gap-3">
            <a
              href="https://t.me/+Ej3I0qkIEJFkZWI0"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl bg-background/40 px-4 py-3 backdrop-blur-md transition-all hover:bg-[#229ED9]/10"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#229ED9]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#229ED9]">Official Channel</p>
                <p className="text-xs font-medium text-foreground/90 truncate">Join ORBIT on Telegram — backup link if we go dark</p>
              </div>
              <span className="flex-shrink-0 rounded-full bg-[#229ED9] px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-widest">Join</span>
            </a>

            <div className="flex items-center gap-2 rounded-xl bg-background/40 px-4 py-2.5 backdrop-blur-md">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mr-1">Share</span>
              {[
                { label: "Telegram", color: "#229ED9", href: `https://t.me/share/url?url=${encodeURIComponent("https://orbitstream.app")}&text=${encodeURIComponent("Watch free movies & series on ORBIT 🎬")}`, icon: <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
                { label: "WhatsApp", color: "#25D366", href: `https://wa.me/?text=${encodeURIComponent("Watch free movies & series on ORBIT 🎬 https://orbitstream.app")}`, icon: <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> },
                { label: "X", color: "#000", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Watch free movies & series on ORBIT 🎬")}&url=${encodeURIComponent("https://orbitstream.app")}`, icon: <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg> },
                { label: "Facebook", color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://orbitstream.app")}`, icon: <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                { label: "Reddit", color: "#FF4500", href: `https://reddit.com/submit?url=${encodeURIComponent("https://orbitstream.app")}&title=${encodeURIComponent("Watch free movies & series on ORBIT")}`, icon: <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg> },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Share on ${s.label}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform hover:scale-110"
                  style={{ backgroundColor: s.color }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
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

