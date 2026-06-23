import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";

const ARTICLES = [
  { date: "Jun 2026", source: "Variety", title: "ORBIT crosses 80M global subscribers, doubles down on anime originals" },
  { date: "May 2026", source: "Hollywood Reporter", title: "Inside the ORBIT writers' room: how prestige series get greenlit" },
  { date: "Apr 2026", source: "Indiewire", title: "ORBIT's late-night programming strategy is quietly winning awards" },
  { date: "Mar 2026", source: "The Verge", title: "ORBIT rolls out spatial audio across all premium tiers" },
  { date: "Feb 2026", source: "Bloomberg", title: "Streaming wars: ORBIT positions itself as the cinephile alternative" },
];

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press — ORBIT" },
      { name: "description", content: "Press releases, media kit, and coverage of ORBIT." },
    ],
  }),
  component: PressPage,
});

function PressPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Studio · Newsroom"
        title="Press"
        description="Releases, coverage, and resources for journalists writing about ORBIT."
      />
      <section className="py-16">
        <div className="mx-auto grid max-w-[1300px] grid-cols-12 gap-10 px-6 md:px-10">
          <div className="col-span-12 md:col-span-8">
            <h2 className="mb-8 font-display text-2xl font-semibold">In the news</h2>
            <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
              {ARTICLES.map((a) => (
                <li key={a.title} className="flex flex-col gap-2 p-6 md:flex-row md:items-center md:gap-6">
                  <div className="w-24 flex-shrink-0 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {a.date}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-ice">{a.source}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold leading-snug">{a.title}</h3>
                  </div>
                  <a href="#" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                    Read →
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="rounded-2xl border border-border bg-surface p-8">
              <h3 className="font-display text-xl font-semibold">Media kit</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Brand assets, logos, executive bios, and high-res stills from our originals.
              </p>
              <a
                href="#"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
              >
                Download Media Kit
              </a>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-8">
              <h3 className="font-display text-xl font-semibold">Press contact</h3>
              <p className="mt-3 text-sm text-muted-foreground">For all media inquiries:</p>
              <a href="mailto:press@orbit.tv" className="mt-3 block text-sm text-ice hover:underline">
                press@orbit.tv
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
