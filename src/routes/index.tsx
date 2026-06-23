import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";

import hero from "@/assets/hero-astronaut.jpg";
import p1 from "@/assets/poster-1.jpg";
import p2 from "@/assets/poster-2.jpg";
import p3 from "@/assets/poster-3.jpg";
import p4 from "@/assets/poster-4.jpg";
import p5 from "@/assets/poster-5.jpg";
import p6 from "@/assets/poster-6.jpg";
import w1 from "@/assets/wide-1.jpg";
import w2 from "@/assets/wide-2.jpg";
import w3 from "@/assets/wide-3.jpg";

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

const POSTERS = [
  { img: p1, title: "Nebula Drift", year: 2025, rating: "9.1", tag: "ORIGINAL", genre: "Sci-Fi" },
  { img: p2, title: "Neon Tokyo", year: 2024, rating: "8.7", tag: "ANIME", genre: "Cyberpunk" },
  { img: p3, title: "Moonlit Cases", year: 2024, rating: "8.9", tag: "SERIES", genre: "Noir" },
  { img: p4, title: "Crown of Ash", year: 2025, rating: "9.3", tag: "EPIC", genre: "Fantasy" },
  { img: p5, title: "Sakura Steel", year: 2024, rating: "9.0", tag: "ANIME", genre: "Action" },
  { img: p6, title: "After Silence", year: 2023, rating: "8.4", tag: "FILM", genre: "Drama" },
];

const TRENDING = [
  { img: w1, title: "Hollow Sector", meta: "Season 2 · 8 Episodes" },
  { img: w2, title: "Iron Monsoon", meta: "Anime Series · 24 Eps" },
  { img: w3, title: "Pale Woods", meta: "Limited Series · 6 Eps" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <RailSection title="Trending Now" subtitle="Most watched this cycle" items={POSTERS} />
      <SpotlightStrip />
      <RailSection title="Anime · Selected" subtitle="From Tokyo to the cosmos" items={[...POSTERS].reverse()} />
      <FeatureBlock />
      <RailSection title="Continue Watching" subtitle="Pick up where you drifted off" items={POSTERS.slice(0, 5)} />
      <Footer />
    </div>
  );
}

/* ---------------- NAV ---------------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl bg-background/70 border-b border-border" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-12">
          <a href="#" className="flex items-baseline gap-1 font-display text-2xl font-bold tracking-tight">
            ORBIT<sup className="text-[10px] font-normal text-muted-foreground">®</sup>
          </a>
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
          <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
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
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section className="relative film-grain min-h-[100vh] w-full overflow-hidden">
      {/* background */}
      <img
        src={hero}
        alt="Astronaut drifting through deep space"
        width={1600}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-vignette)" }} />
      <div className="absolute inset-0" style={{ background: "var(--gradient-fade-bottom)" }} />
      <div className="absolute inset-0 hidden md:block" style={{ background: "var(--gradient-fade-right)" }} />

      {/* vertical guide lines like the reference */}
      <div className="pointer-events-none absolute inset-0 mx-auto hidden max-w-[1600px] md:block">
        {[20, 40, 60, 80].map((p) => (
          <div
            key={p}
            className="absolute top-0 h-full w-px bg-foreground/5"
            style={{ left: `${p}%` }}
          />
        ))}
      </div>

      {/* content grid */}
      <div className="relative z-10 mx-auto grid h-screen max-w-[1600px] grid-cols-12 gap-6 px-6 pb-16 pt-32 md:px-10 md:pt-36">
        {/* Left block */}
        <div className="col-span-12 flex flex-col justify-between md:col-span-5">
          <div>
            <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-ice/60" />
              <span>Featured · Original Film</span>
            </div>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-[5.5rem]">
              Discover<br />
              the wonders<br />
              <span className="text-ice text-glow">of cinema.</span>
            </h1>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Stream cinematic films, prestige series, and the finest anime — handpicked, uninterrupted, and built for the dark.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button className="group inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
              <Play className="h-4 w-4 fill-current" /> Watch Trailer
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-6 py-3.5 text-sm font-medium backdrop-blur-md transition-colors hover:bg-surface">
              <Plus className="h-4 w-4" /> My List
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 p-3.5 backdrop-blur-md transition-colors hover:bg-surface">
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right block */}
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
                Now<br />
                Streaming
                <span className="ml-2 align-top text-base text-muted-foreground">/24</span>
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Worldwide · 4K HDR
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* discover circle */}
      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <button className="group flex h-28 w-28 animate-float-slow flex-col items-center justify-center rounded-full border border-border bg-background/30 text-xs uppercase tracking-[0.2em] text-foreground backdrop-blur-md transition-all hover:border-ice hover:bg-background/60">
          Discover
          <ChevronRight className="mt-1 h-3 w-3 rotate-90" />
        </button>
      </div>

      {/* bottom meta strip */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-border bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs uppercase tracking-[0.2em] text-muted-foreground md:px-10">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><Star className="h-3 w-3 fill-ice text-ice" /> 9.2 / 10</span>
            <span className="hidden md:inline">2h 14m</span>
            <span className="hidden md:inline">Sci-Fi · Drama</span>
            <span className="hidden md:inline">PG-13</span>
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

/* ---------------- RAIL ---------------- */
function RailSection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: typeof POSTERS;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-ice/60" />
              {subtitle}
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {title}
            </h2>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => scroll(-1)}
              className="rounded-full border border-border p-3 transition-colors hover:bg-surface"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="rounded-full border border-border p-3 transition-colors hover:bg-surface"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={ref}
          className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-10 md:px-10"
        >
          {items.map((it, i) => (
            <PosterCard key={`${title}-${i}`} index={i + 1} item={it} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PosterCard({ item, index }: { item: (typeof POSTERS)[number]; index: number }) {
  return (
    <article className="group relative aspect-[2/3] w-[220px] flex-shrink-0 snap-start overflow-hidden rounded-md border border-border bg-surface md:w-[260px]">
      <img
        src={item.img}
        alt={item.title}
        loading="lazy"
        width={520}
        height={780}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />

      {/* index numeral */}
      <div className="absolute left-3 top-3 font-display text-xs font-medium tracking-widest text-muted-foreground">
        {String(index).padStart(2, "0")}
      </div>

      {/* tag */}
      <div className="absolute right-3 top-3 rounded-sm border border-border bg-background/60 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-ice backdrop-blur-md">
        {item.tag}
      </div>

      {/* meta */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>{item.year}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span>{item.genre}</span>
        </div>
        <h3 className="font-display text-xl font-semibold leading-tight">{item.title}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-ice text-ice" /> {item.rating}
        </div>

        <div className="mt-4 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-primary-foreground">
            <Play className="h-3.5 w-3.5 fill-current" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur-md">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------- SPOTLIGHT STRIP ---------------- */
function SpotlightStrip() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface/30 py-12">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex animate-[float-slow_8s_ease-in-out_infinite] flex-wrap items-baseline justify-between gap-6">
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

/* ---------------- FEATURE BLOCK ---------------- */
function FeatureBlock() {
  return (
    <section className="relative py-24">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-6 px-6 md:px-10">
        <div className="col-span-12 md:col-span-7">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border film-grain">
            <img
              src={TRENDING[0].img}
              alt={TRENDING[0].title}
              loading="lazy"
              width={1280}
              height={720}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
              <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-ice">Featured Series</div>
              <h3 className="font-display text-3xl font-semibold leading-tight md:text-5xl">
                Hollow Sector
              </h3>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                A derelict starship. A crew that won't admit what they brought back. Season two begins in the dark.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
                <Play className="h-3 w-3 fill-current" /> Play S2 · E1
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-6 md:col-span-5">
          <div className="rounded-lg border border-border bg-surface p-8">
            <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-ice/60" /> Editor's Note
            </div>
            <h3 className="font-display text-2xl font-semibold leading-snug">
              Expand your horizons.
            </h3>
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

/* ---------------- FOOTER ---------------- */
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
