import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/lib/tmdb";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { MediaGrid } from "@/components/site/MediaGrid";

export const Route = createFileRoute("/films")({
  head: () => ({
    meta: [
      { title: "Films — ORBIT" },
      { name: "description", content: "Browse the ORBIT film catalogue. Popular, top rated, action, and sci-fi cinema curated for the night." },
      { property: "og:title", content: "Films — ORBIT" },
      { property: "og:description", content: "A handpicked universe of cinema." },
    ],
  }),
  component: FilmsPage,
});

function FilmsPage() {
  const popular = useQuery({ queryKey: ["popularMovies"], queryFn: tmdbApi.popularMovies });
  const top = useQuery({ queryKey: ["topRatedMovies"], queryFn: tmdbApi.topRatedMovies });
  const action = useQuery({ queryKey: ["actionMovies"], queryFn: tmdbApi.actionMovies });
  const scifi = useQuery({ queryKey: ["scifiMovies"], queryFn: tmdbApi.scifiMovies });

  return (
    <PageShell>
      <PageHero
        eyebrow="Catalogue · Cinema"
        title="Films"
        description="From midnight noir to blockbuster spectacle — every frame curated for the screen."
      />
      <Section title="Popular Now" items={popular.data?.results ?? []} loading={popular.isLoading} />
      <Section title="Top Rated" items={top.data?.results ?? []} loading={top.isLoading} />
      <Section title="Action & Adventure" items={action.data?.results ?? []} loading={action.isLoading} />
      <Section title="Sci-Fi & Fantasy" items={scifi.data?.results ?? []} loading={scifi.isLoading} />
    </PageShell>
  );
}

function Section({ title, items, loading }: { title: string; items: any[]; loading: boolean }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <h2 className="mb-8 font-display text-2xl font-semibold md:text-3xl">{title}</h2>
        <MediaGrid items={items} mediaType="movie" loading={loading} />
      </div>
    </section>
  );
}
