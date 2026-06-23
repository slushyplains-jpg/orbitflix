import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/site/PageShell";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — ORBIT" },
      { name: "description", content: "Sign in or create your ORBIT account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate({ to: "/profile" });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (error) throw error;
        setMessage("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/profile" });
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="relative">
        <div className="mx-auto grid min-h-[80vh] max-w-[1600px] grid-cols-12 gap-10 px-6 py-16 md:px-10 md:py-24">
          <div className="col-span-12 flex flex-col justify-center md:col-span-5">
            <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-ice/60" />
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </div>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-6xl">
              {mode === "signin" ? (
                <>Step back<br /><span className="text-ice text-glow">into orbit.</span></>
              ) : (
                <>Begin your<br /><span className="text-ice text-glow">journey.</span></>
              )}
            </h1>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">
              {mode === "signin"
                ? "Your watchlist, your devices, your continue-watching — all in one place."
                : "Create a free account. Your watchlist syncs across all your devices."}
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <div className="rounded-2xl border border-border bg-surface/60 p-8 backdrop-blur-md md:p-12">
              {/* Tab toggle */}
              <div className="mb-8 flex gap-2 rounded-full border border-border bg-background p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(""); setMessage(""); }}
                    className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      mode === m ? "bg-foreground text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              {/* Error / success messages */}
              {error && (
                <div className="mb-5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {message && (
                <div className="mb-5 rounded-lg border border-ice/30 bg-ice/10 px-4 py-3 text-sm text-ice">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <Field
                    label="Name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                )}
                <Field
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-muted-foreground">
                By continuing you agree to our{" "}
                <Link to="/terms" className="text-foreground hover:text-ice">Terms</Link> &{" "}
                <Link to="/privacy" className="text-foreground hover:text-ice">Privacy</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
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
