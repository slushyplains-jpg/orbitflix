import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Monitor, Smartphone, Tv, Tablet, Trash2 } from "lucide-react";
import { PageShell, PageHero } from "@/components/site/PageShell";

interface Device {
  id: string;
  name: string;
  type: "tv" | "phone" | "tablet" | "desktop";
  location: string;
  lastActive: string;
  current?: boolean;
}

const SEED: Device[] = [
  { id: "1", name: "Living Room TV", type: "tv", location: "Berlin, DE", lastActive: "Active now", current: true },
  { id: "2", name: "Astra's iPhone", type: "phone", location: "Berlin, DE", lastActive: "2 hours ago" },
  { id: "3", name: "MacBook Pro", type: "desktop", location: "Berlin, DE", lastActive: "Yesterday" },
  { id: "4", name: "iPad Air", type: "tablet", location: "Lisbon, PT", lastActive: "3 days ago" },
  { id: "5", name: "Bedroom Chromecast", type: "tv", location: "Berlin, DE", lastActive: "1 week ago" },
];

const ICONS = { tv: Tv, phone: Smartphone, tablet: Tablet, desktop: Monitor };

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Devices — ORBIT" },
      { name: "description", content: "Manage devices signed into your ORBIT account." },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const [devices, setDevices] = useState(SEED);

  const remove = (id: string) => setDevices((d) => d.filter((x) => x.id !== id));
  const removeAll = () => setDevices((d) => d.filter((x) => x.current));

  return (
    <PageShell>
      <PageHero
        eyebrow="Account · Security"
        title="Devices"
        description="Every device currently signed into your account. Remove any you don't recognize."
      />
      <section className="py-16">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {devices.length} device{devices.length === 1 ? "" : "s"}
            </p>
            <button
              onClick={removeAll}
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Sign out everywhere else
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {devices.map((d, i) => {
              const Icon = ICONS[d.type];
              return (
                <div
                  key={d.id}
                  className={`flex items-center gap-5 p-5 md:p-6 ${i !== 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display font-semibold">{d.name}</h3>
                      {d.current && (
                        <span className="rounded-full border border-ice/40 bg-ice/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-ice">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.location} · {d.lastActive}
                    </p>
                  </div>
                  {!d.current && (
                    <button
                      onClick={() => remove(d.id)}
                      className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:bg-background hover:text-foreground"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            See a device you don't recognize? Remove it, then change your password from Profile.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
