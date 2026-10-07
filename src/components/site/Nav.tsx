import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bell, Search, X, Menu, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi, IMG_URL, type TMDBItem } from "@/lib/tmdb";
import { useAuth } from "@/hooks/use-auth";
import { useRoom, IDX_SERVER } from "@/contexts/RoomContext";

const LINKS: { label: string; to: string }[] = [
  { label: "Home", to: "/" },
  { label: "Films", to: "/films" },
  { label: "Series", to: "/series" },
  { label: "Anime", to: "/anime" },
  { label: "Top IMDb", to: "/top-imdb" },
  { label: "My List", to: "/my-list" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const roomInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { joinRoom } = useRoom();

  function joinRoomFromNav() {
    const raw = roomCode.trim().toUpperCase();
    if (!raw) return;
    setRoomOpen(false);
    setRoomCode("");

    const parts = raw.split("-");
    if (parts.length >= 3) {
      // Format: MOVIEID-SERVERIDX-SYNCCODE
      const [movieId, serverIdx, ...rest] = parts;
      const syncCode = rest.join("-");
      const srv = IDX_SERVER[serverIdx];
      joinRoom(syncCode, srv);
      navigate({ to: "/movie/$movieId", params: { movieId } });
    } else if (parts.length === 2) {
      // Format: MOVIEID-SYNCCODE
      const [movieId, syncCode] = parts;
      joinRoom(syncCode);
      navigate({ to: "/movie/$movieId", params: { movieId } });
    } else {
      // Bare sync code — join in current tab
      joinRoom(raw);
    }
  }

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

  useEffect(() => {
    if (roomOpen) setTimeout(() => roomInputRef.current?.focus(), 50);
  }, [roomOpen]);

  // Close room popover on outside click
  useEffect(() => {
    if (!roomOpen) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("__orbit_room_popover");
      if (el && !el.contains(e.target as Node)) setRoomOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [roomOpen]);

  // Close mobile menu on route change / scroll
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
            <Link to="/" className="flex items-baseline gap-1 font-display text-2xl font-bold tracking-tight" onClick={() => setMobileOpen(false)}>
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

            {/* Watch Together */}
            <div id="__orbit_room_popover" className="relative hidden md:block">
              <button
                onClick={() => setRoomOpen((v) => !v)}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                title="Watch Together"
              >
                <Users className="h-4 w-4" />
              </button>
              {roomOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-background shadow-2xl p-4 z-[200]">
                  <p className="text-sm font-medium mb-1">Watch Together</p>
                  <p className="text-xs text-muted-foreground mb-3">Paste a room code from your friend to jump straight into the same movie.</p>
                  <div className="flex gap-2">
                    <input
                      ref={roomInputRef}
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && joinRoomFromNav()}
                      placeholder="550-ABC123"
                      className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500"
                      maxLength={16}
                    />
                    <button
                      onClick={joinRoomFromNav}
                      disabled={!roomCode.trim()}
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-4 py-2 text-sm font-medium text-white transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground md:flex">
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden h-8 w-px bg-border md:block" />
            {user ? (
              <Link
                to="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ice to-accent ring-2 ring-border text-sm font-bold text-primary-foreground"
              >
                {(user.email ?? "?")[0].toUpperCase()}
              </Link>
            ) : (
              <Link
                to="/auth"
                className="hidden rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-primary-foreground md:block"
              >
                Sign In
              </Link>
            )}
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur-2xl md:hidden">
            <nav className="flex flex-col px-6 py-6 gap-1">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "text-foreground bg-surface" }}
                  className="rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-4 border-t border-border pt-4">
                {user ? (
                  <Link to="/profile" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-surface hover:text-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ice to-accent text-sm font-bold text-primary-foreground">
                      {(user.email ?? "?")[0].toUpperCase()}
                    </div>
                    Profile
                  </Link>
                ) : (
                  <Link to="/auth" onClick={() => setMobileOpen(false)}
                    className="block rounded-full border border-border px-5 py-3 text-center text-sm font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-primary-foreground">
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
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
