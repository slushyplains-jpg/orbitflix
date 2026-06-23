import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/lib/tmdb";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { MediaGrid } from "@/components/site/MediaGrid";

export const Route = createFileRoute("/anime")({
  head: () => ({
    meta: [
      { title: "Anime — ORBIT" },
      { name: "description", content: "Anime selections from Tokyo to the cosmos — curated on ORBIT." },
      { property: "og:title", content: "Anime — ORBIT" },
      { property: "og:description", content: "From Tokyo to the cosmos." },
    ],
  }),
  component: AnimePage,
});

function AnimePage() {
  const anime = useQuery({ queryKey: ["animeTV"], queryFn: tmdbApi.animeTV });

  return (
    <PageShell>
      <PageHero
        eyebrow="Catalogue · Animation"
        title="Anime"
        description="From the slow burn of late-night drama to high-orbit space operas — animation at its most cinematic."
      />
      <section className="py-16">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <h2 className="mb-8 font-display text-2xl font-semibold md:text-3xl">Selected Titles</h2>
          <MediaGrid items={anime.data?.results ?? []} mediaType="tv" loading={anime.isLoading} />
        </div>
      </section>
    </PageShell>
  );
}
