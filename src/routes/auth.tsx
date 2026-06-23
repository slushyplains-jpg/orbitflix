import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";

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
                : "30-day free trial. Cancel anytime. 4K HDR and Atmos included."}
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <div className="rounded-2xl border border-border bg-surface/60 p-8 backdrop-blur-md md:p-12">
              <div className="mb-8 flex gap-2 rounded-full border border-border bg-background p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      mode === m ? "bg-foreground text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="space-y-5"
              >
                {mode === "signup" && <Field label="Name" type="text" placeholder="Your name" />}
                <Field label="Email" type="email" placeholder="you@orbit.tv" />
                <Field label="Password" type="password" placeholder="••••••••" />

                <button
                  type="submit"
                  className="w-full rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.01]"
                >
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="rounded-full border border-border bg-background px-4 py-3 text-xs font-semibold uppercase tracking-widest text-foreground hover:bg-surface">
                  Google
                </button>
                <button className="rounded-full border border-border bg-background px-4 py-3 text-xs font-semibold uppercase tracking-widest text-foreground hover:bg-surface">
                  Apple
                </button>
              </div>

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
