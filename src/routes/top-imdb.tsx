import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { MediaGrid } from "@/components/site/MediaGrid";

export const Route = createFileRoute("/top-imdb")({
  head: () => ({
    meta: [
      { title: "Top IMDb — ORBIT" },
      { name: "description", content: "The highest-rated films of all time, ranked by IMDb score." },
      { property: "og:title", content: "Top IMDb — ORBIT" },
    ],
  }),
  component: TopImdbPage,
});

function TopImdbPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["topImdb", page],
    queryFn: () => tmdbApi.topImdb(page),
  });

  const totalPages = Math.min(data?.total_pages ?? 1, 500);

  return (
    <PageShell>
      <PageHero
        eyebrow="Rankings · Cinema"
        title={
          <span className="flex items-center gap-4">
            Top IMDb
            <Trophy className="h-10 w-10 text-yellow-400 md:h-12 md:w-12" />
          </span>
        }
        description="The greatest films ever made — ranked by audience ratings with over 5,000 votes."
      />

      <section className="py-10">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          {/* Rank numbers overlay grid */}
          <div className="relative">
            <MediaGrid items={data?.results ?? []} mediaType="movie" loading={isLoading} />
          </div>

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
                  <span key={`e-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
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
