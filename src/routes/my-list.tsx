import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Play } from "lucide-react";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useMyList } from "@/hooks/use-my-list";
import { IMG_URL } from "@/lib/tmdb";

export const Route = createFileRoute("/my-list")({
  head: () => ({
    meta: [
      { title: "My List — ORBIT" },
      { name: "description", content: "Your personal ORBIT watchlist." },
    ],
  }),
  component: MyListPage,
});

function MyListPage() {
  const { list, remove, clear } = useMyList();

  return (
    <PageShell>
      <PageHero
        eyebrow="Account · Watchlist"
        title="My List"
        description={`${list.length} title${list.length === 1 ? "" : "s"} saved for later viewing.`}
      />
      <section className="py-16">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          {list.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface/40 p-16 text-center">
              <h3 className="font-display text-2xl font-semibold">Your list is empty.</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Tap the <span className="text-foreground">+</span> on any title to save it for later.
              </p>
              <Link
                to="/films"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
              >
                Browse Films
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{list.length} saved</p>
                <button
                  onClick={clear}
                  className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {list.map((entry) => {
                  const to = entry.type === "tv" ? "/tv/$tvId" : "/movie/$movieId";
                  const params =
                    entry.type === "tv" ? { tvId: String(entry.id) } : { movieId: String(entry.id) };
                  return (
                    <div key={`${entry.type}-${entry.id}`} className="group relative">
                      <Link
                        to={to}
                        params={params}
                        className="block aspect-[2/3] overflow-hidden rounded-md border border-border bg-surface"
                      >
                        {entry.poster_path ? (
                          <img
                            src={IMG_URL(entry.poster_path, "w500")}
                            alt={entry.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            {entry.title}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-70" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-display text-sm font-semibold line-clamp-2">{entry.title}</h3>
                        </div>
                      </Link>
                      <button
                        onClick={() => remove(entry.id, entry.type)}
                        className="absolute right-2 top-2 rounded-full border border-border bg-background/70 p-2 backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
