import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/site/PageShell";

interface CookieCategory {
  id: string;
  name: string;
  body: string;
  required?: boolean;
}

const CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    name: "Strictly necessary",
    body: "Required to keep you signed in, play video, and run security. Always on.",
    required: true,
  },
  {
    id: "performance",
    name: "Performance",
    body: "Helps us measure player smoothness, error rates, and load times so we can keep the experience fast.",
  },
  {
    id: "personalization",
    name: "Personalization",
    body: "Powers tailored recommendations, your continue-watching row, and personalized homepage.",
  },
  {
    id: "marketing",
    name: "Marketing",
    body: "Measures the impact of our ad campaigns and lets us show you relevant ORBIT promotions off-site.",
  },
];

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Preferences — ORBIT" },
      { name: "description", content: "Manage your cookie preferences for the ORBIT service." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    essential: true,
    performance: true,
    personalization: true,
    marketing: false,
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Legal · Preferences"
        title="Cookie Preferences"
        description="ORBIT uses cookies and similar technologies to run the service and improve your experience. Decide what you're comfortable with."
      />
      <section className="py-16">
        <div className="mx-auto max-w-[900px] px-6 md:px-10">
          <div className="space-y-4">
            {CATEGORIES.map((c) => (
              <div key={c.id} className="flex items-start gap-5 rounded-2xl border border-border bg-surface p-6">
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
                  {c.required && (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-ice">Required</p>
                  )}
                </div>
                <button
                  disabled={c.required}
                  onClick={() => setPrefs((p) => ({ ...p, [c.id]: !p[c.id] }))}
                  className={`relative mt-1 h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
                    prefs[c.id] ? "bg-ice" : "bg-border"
                  } disabled:opacity-60`}
                  aria-label={`Toggle ${c.name}`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-background transition-transform ${
                      prefs[c.id] ? "translate-x-[1.4rem]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() =>
                setPrefs({ essential: true, performance: false, personalization: false, marketing: false })
              }
              className="rounded-full border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-surface"
            >
              Reject all
            </button>
            <button
              onClick={() =>
                setPrefs({ essential: true, performance: true, personalization: true, marketing: true })
              }
              className="rounded-full border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-surface"
            >
              Accept all
            </button>
            <button className="rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
              Save Preferences
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
