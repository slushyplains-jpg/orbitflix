import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { tmdbApi, TV_GENRES, TV_SORT_OPTIONS } from "@/lib/tmdb";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { MediaGrid } from "@/components/site/MediaGrid";

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "Series — ORBIT" },
      { name: "description", content: "Binge-worthy series, prestige dramas and limited runs curated on ORBIT." },
      { property: "og:title", content: "Series — ORBIT" },
      { property: "og:description", content: "Television, reimagined." },
    ],
  }),
  component: SeriesPage,
});

function SeriesPage() {
  const [genre, setGenre] = useState(0);
  const [sort, setSort] = useState("popularity.desc");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [genre, sort]);

  const { data, isLoading } = useQuery({
    queryKey: ["discoverTV", page, genre, sort],
    queryFn: () => tmdbApi.discoverTV(page, genre, sort),
  });

  const totalPages = Math.min(data?.total_pages ?? 1, 500);

  return (
    <PageShell>
      <PageHero
        eyebrow="Catalogue · Television"
        title="Series"
        description="Prestige dramas, sharp comedies, and limited runs built for late-night marathons."
      />

      <section className="py-10">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">

          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {TV_GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenre(g.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    genre === g.id
                      ? "bg-ice text-background"
                      : "border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ice cursor-pointer"
              >
                {TV_SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <MediaGrid items={data?.results ?? []} mediaType="tv" loading={isLoading} />

          {!isLoading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(Number(p))}
                    className={`h-9 min-w-[36px] rounded-lg px-3 text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-ice text-background"
                        : "border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Page {page} of {totalPages.toLocaleString()}
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
