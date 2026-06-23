import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { supabase, type Profile } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useMyList } from "@/hooks/use-my-list";
import { Star, Film, Tv, Loader2, LogOut, Save } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ORBIT" },
      { name: "description", content: "Manage your ORBIT profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { list } = useMyList();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  // Load profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as Profile);
          setDisplayName(data.display_name ?? "");
          setAvatarUrl(data.avatar_url ?? "");
        }
      });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName, avatar_url: avatarUrl });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (authLoading || !user) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  const movieCount = list.filter((i) => i.type === "movie").length;
  const tvCount = list.filter((i) => i.type === "tv").length;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <PageShell>
      <PageHero eyebrow="Account" title="Profile" description="Your account and preferences." />
      <section className="py-16">
        <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-8 px-6 md:px-10">
          {/* Left card */}
          <div className="col-span-12 md:col-span-4">
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              {/* Avatar */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="mx-auto h-28 w-28 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-ice to-accent text-3xl font-bold text-primary-foreground">
                  {(displayName || user.email || "?")[0].toUpperCase()}
                </div>
              )}

              <h2 className="mt-6 font-display text-2xl font-semibold">
                {displayName || "No name set"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-ice">
                <Star className="h-3 w-3 fill-ice text-ice" /> Member
              </div>

              <div className="mt-8 space-y-3 text-sm">
                <Link
                  to="/my-list"
                  className="block w-full rounded-full border border-border py-3 text-xs font-semibold uppercase tracking-widest hover:bg-background"
                >
                  My List ({list.length})
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 py-3 text-xs font-semibold uppercase tracking-widest text-destructive hover:bg-destructive/10"
                >
                  {signingOut ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className="col-span-12 space-y-8 md:col-span-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              <Stat icon={<Film className="h-3 w-3" />} label="Films saved" value={String(movieCount)} />
              <Stat icon={<Tv className="h-3 w-3" />} label="Series saved" value={String(tvCount)} />
              <Stat icon={<Star className="h-3 w-3 fill-ice text-ice" />} label="Member since" value={memberSince} />
            </div>

            {/* Edit profile */}
            <div className="rounded-2xl border border-border bg-surface p-8">
              <h3 className="font-display text-xl font-semibold">Edit Profile</h3>
              <div className="mt-6 space-y-5">
                <Field
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
                <Field
                  label="Avatar URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save Changes
                  </button>
                  {saved && <span className="text-xs text-ice">Saved ✓</span>}
                </div>
              </div>
            </div>

            {/* Account details (read-only) */}
            <div className="rounded-2xl border border-border bg-surface p-8">
              <h3 className="font-display text-xl font-semibold">Account Details</h3>
              <div className="mt-6 space-y-5 text-sm">
                <Row label="Email" value={user.email ?? "—"} />
                <Row label="Member Since" value={memberSince} />
                <Row label="User ID" value={user.id.slice(0, 8) + "..."} />
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
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ice"
      />
    </label>
  );
}
