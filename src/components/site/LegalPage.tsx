import type { ReactNode } from "react";
import { PageShell, PageHero } from "./PageShell";

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: { h: string; body: ReactNode }[];
}) {
  return (
    <PageShell>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <section className="py-16">
        <div className="mx-auto grid max-w-[1200px] grid-cols-12 gap-10 px-6 md:px-10">
          <aside className="col-span-12 md:col-span-3">
            <div className="sticky top-28 space-y-3 text-xs">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Last updated
              </div>
              <div className="font-display text-lg">{updated}</div>
              <nav className="mt-6 space-y-2">
                {sections.map((s, i) => (
                  <a
                    key={s.h}
                    href={`#s${i}`}
                    className="block text-muted-foreground hover:text-foreground"
                  >
                    {String(i + 1).padStart(2, "0")} · {s.h}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
          <div className="col-span-12 space-y-12 md:col-span-9">
            {sections.map((s, i) => (
              <section key={s.h} id={`s${i}`} className="scroll-mt-32">
                <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Section {String(i + 1).padStart(2, "0")}
                </div>
                <h2 className="font-display text-3xl font-semibold">{s.h}</h2>
                <div className="prose-invert mt-5 max-w-none space-y-4 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </div>
              </section>
            ))}
            <p className="border-t border-border pt-8 text-xs text-muted-foreground">
              This page is maintained by Orbit Pictures to answer common questions about how ORBIT works. It is not a legal contract and does not replace any signed agreement.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
