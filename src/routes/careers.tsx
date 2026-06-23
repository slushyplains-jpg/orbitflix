import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";

const ROLES = [
  { team: "Engineering", title: "Senior Streaming Infrastructure Engineer", location: "Berlin · Remote OK" },
  { team: "Engineering", title: "Staff Frontend Engineer, Player", location: "Lisbon · Remote OK" },
  { team: "Design", title: "Principal Product Designer, Discovery", location: "Berlin · On-site" },
  { team: "Design", title: "Motion Designer, Brand", location: "Remote · Global" },
  { team: "Content", title: "Director, Anime Acquisitions", location: "Tokyo · On-site" },
  { team: "Content", title: "Editor, Originals", location: "Los Angeles · Hybrid" },
  { team: "Data", title: "ML Engineer, Recommendations", location: "Remote · EU" },
  { team: "Marketing", title: "Brand Partnerships Lead", location: "London · Hybrid" },
];

const VALUES = [
  { h: "Cinema first", b: "Every decision starts from the story. Frame rates, color, audio — we don't compromise on the experience." },
  { h: "Curated, not infinite", b: "We'd rather ship fewer titles done with care than a feed without a soul." },
  { h: "Quiet craft", b: "We sweat the typography, the timings, the sound design. The details are the product." },
];

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — ORBIT" },
      { name: "description", content: "Help build the next chapter of cinematic streaming. Open roles at ORBIT." },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Studio · Hiring"
        title="Careers"
        description="Help us build the next chapter of cinematic streaming."
      />

      <section className="py-16">
        <div className="mx-auto max-w-[1300px] px-6 md:px-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.h} className="rounded-2xl border border-border bg-surface p-8">
                <h3 className="font-display text-xl font-semibold">{v.h}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1300px] px-6 md:px-10">
          <h2 className="mb-10 font-display text-3xl font-semibold md:text-4xl">Open roles</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {ROLES.map((r, i) => (
              <a
                key={r.title}
                href="#"
                className={`flex flex-col gap-2 p-6 transition-colors hover:bg-background md:flex-row md:items-center md:gap-8 ${
                  i !== 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="w-32 flex-shrink-0 text-[10px] uppercase tracking-[0.25em] text-ice">{r.team}</div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{r.location}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Apply →</span>
              </a>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted-foreground">
            Don't see your role? Send us a note at{" "}
            <a href="mailto:careers@orbit.tv" className="text-ice hover:underline">careers@orbit.tv</a>.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
