import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { Star, Clock, Film, Tv } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ORBIT" },
      { name: "description", content: "Manage your ORBIT profile, preferences, and viewing history." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <PageShell>
      <PageHero eyebrow="Account" title="Profile" description="Your account, your preferences." />
      <section className="py-16">
        <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-8 px-6 md:px-10">
          <div className="col-span-12 md:col-span-4">
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-ice to-accent" />
              <h2 className="mt-6 font-display text-2xl font-semibold">Astra Observer</h2>
              <p className="mt-1 text-sm text-muted-foreground">astra@orbit.tv</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-ice">
                <Star className="h-3 w-3 fill-ice text-ice" /> Premium Member
              </div>
              <div className="mt-8 space-y-3 text-sm">
                <Link to="/my-list" className="block w-full rounded-full border border-border py-3 text-xs font-semibold uppercase tracking-widest hover:bg-background">My List</Link>
                <Link to="/devices" className="block w-full rounded-full border border-border py-3 text-xs font-semibold uppercase tracking-widest hover:bg-background">Devices</Link>
                <Link to="/subscription" className="block w-full rounded-full bg-foreground py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">Subscription</Link>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-8 space-y-8">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              <Stat icon={<Film className="h-3 w-3" />} label="Films" value="142" />
              <Stat icon={<Tv className="h-3 w-3" />} label="Series" value="38" />
              <Stat icon={<Clock className="h-3 w-3" />} label="Hours" value="312" />
              <Stat icon={<Star className="h-3 w-3 fill-ice text-ice" />} label="Avg Rating" value="8.4" />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-8">
              <h3 className="font-display text-xl font-semibold">Account Details</h3>
              <div className="mt-6 space-y-5 text-sm">
                <Row label="Name" value="Astra Observer" />
                <Row label="Email" value="astra@orbit.tv" />
                <Row label="Plan" value="Premium · 4K HDR" />
                <Row label="Member Since" value="March 2024" />
                <Row label="Language" value="English (US)" />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-8">
              <h3 className="font-display text-xl font-semibold">Playback Preferences</h3>
              <div className="mt-6 space-y-4 text-sm">
                <Toggle label="Autoplay next episode" defaultOn />
                <Toggle label="Autoplay previews while browsing" />
                <Toggle label="Data saver mode" />
                <Toggle label="Show mature content" defaultOn />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span>{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${defaultOn ? "bg-ice" : "bg-border"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${defaultOn ? "translate-x-[1.4rem]" : "translate-x-0.5"}`} />
      </span>
    </label>
  );
}
