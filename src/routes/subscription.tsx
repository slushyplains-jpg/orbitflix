import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { PageShell, PageHero } from "@/components/site/PageShell";

interface Plan {
  id: "basic" | "standard" | "premium";
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$7.99",
    features: ["HD streaming", "1 device at a time", "Limited downloads", "Standard catalogue"],
  },
  {
    id: "standard",
    name: "Standard",
    price: "$14.99",
    features: ["Full HD streaming", "2 devices at a time", "Unlimited downloads", "Full catalogue"],
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$22.99",
    features: ["4K HDR + Dolby Atmos", "4 devices at a time", "Spatial audio", "Originals previews"],
  },
];

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription — ORBIT" },
      { name: "description", content: "Pick the ORBIT plan that fits your viewing. Change or cancel any time." },
    ],
  }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const [current, setCurrent] = useState<Plan["id"]>("premium");

  return (
    <PageShell>
      <PageHero
        eyebrow="Account · Billing"
        title="Subscription"
        description="Pick a plan that matches how you watch. Change or cancel any time."
      />
      <section className="py-16">
        <div className="mx-auto max-w-[1300px] px-6 md:px-10">
          <div className="mb-10 rounded-2xl border border-border bg-surface p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Current Plan</div>
                <h3 className="mt-2 font-display text-2xl font-semibold">
                  {PLANS.find((p) => p.id === current)?.name} · Renews Aug 12
                </h3>
              </div>
              <button className="rounded-full border border-border px-5 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-background">
                Cancel Subscription
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((p) => {
              const active = p.id === current;
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                    p.highlight ? "border-ice/40 bg-surface" : "border-border bg-surface/60"
                  } ${active ? "ring-2 ring-ice" : ""}`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-ice/40 bg-background px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-ice">
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold">{p.price}</span>
                    <span className="text-sm text-muted-foreground">/ month</span>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-ice" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setCurrent(p.id)}
                    disabled={active}
                    className={`mt-8 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      active
                        ? "border border-border text-muted-foreground"
                        : "bg-foreground text-primary-foreground hover:scale-[1.02]"
                    }`}
                  >
                    {active ? "Current Plan" : "Switch to this plan"}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            All plans include offline downloads on mobile and unlimited streaming. Taxes may apply.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
