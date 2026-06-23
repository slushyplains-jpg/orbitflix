import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bell, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi, IMG_URL, type TMDBItem } from "@/lib/tmdb";

const LINKS: { label: string; to: string }[] = [
  { label: "Home", to: "/" },
  { label: "Films", to: "/films" },
  { label: "Series", to: "/series" },
  { label: "Anime", to: "/anime" },
  { label: "My List", to: "/my-list" },
];

export function Nav() {
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
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "text-foreground" }}
                  className="transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
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
            <Link
              to="/subscription"
              className="hidden rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-primary-foreground md:block"
            >
              Subscribe
            </Link>
            <Link to="/profile" className="h-9 w-9 rounded-full bg-gradient-to-br from-ice to-accent ring-2 ring-border" />
          </div>
        </div>
      </header>

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
    // @ts-expect-error dynamic params
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
