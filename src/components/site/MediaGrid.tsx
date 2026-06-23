import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { IMG_URL, type TMDBItem } from "@/lib/tmdb";

export function MediaGrid({
  items,
  mediaType,
  loading,
}: {
  items: TMDBItem[];
  mediaType?: "movie" | "tv";
  loading?: boolean;
}) {
  if (loading || !items.length) {
    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-md bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  const filtered = items.filter((i) => i.poster_path);

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {filtered.map((item) => {
        const type = mediaType ?? (item.media_type === "tv" ? "tv" : "movie");
        const to = type === "tv" ? "/tv/$tvId" : "/movie/$movieId";
        const params = type === "tv" ? { tvId: String(item.id) } : { movieId: String(item.id) };
        const title = item.title || item.name || "";
        const year = (item.release_date || item.first_air_date)?.slice(0, 4) ?? "";

        return (
          <Link
            // @ts-expect-error dynamic params
            to={to}
            params={params}
            key={item.id}
            className="group relative block aspect-[2/3] overflow-hidden rounded-md border border-border bg-surface"
          >
            <img
              src={IMG_URL(item.poster_path, "w500")}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-80" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="font-display text-sm font-semibold leading-tight line-clamp-2">{title}</h3>
              <div className="mt-1 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>{year}</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-ice text-ice" /> {item.vote_average?.toFixed(1) ?? "—"}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
