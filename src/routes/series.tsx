import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/lib/tmdb";
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
  const popular = useQuery({ queryKey: ["popularTV"], queryFn: tmdbApi.popularTV });

  return (
    <PageShell>
      <PageHero
        eyebrow="Catalogue · Television"
        title="Series"
        description="Prestige dramas, sharp comedies, and limited runs built for late-night marathons."
      />
      <section className="py-16">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <h2 className="mb-8 font-display text-2xl font-semibold md:text-3xl">Popular Series</h2>
          <MediaGrid items={popular.data?.results ?? []} mediaType="tv" loading={popular.isLoading} />
        </div>
      </section>
    </PageShell>
  );
}
