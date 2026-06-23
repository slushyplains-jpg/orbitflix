import { Link } from "@tanstack/react-router";

type FooterLink = { label: string; to: string };

const COLS: { h: string; l: FooterLink[] }[] = [
  {
    h: "Browse",
    l: [
      { label: "Films", to: "/films" },
      { label: "Series", to: "/series" },
      { label: "Anime", to: "/anime" },
      { label: "My List", to: "/my-list" },
    ],
  },
  {
    h: "Account",
    l: [
      { label: "Profile", to: "/profile" },
      { label: "My List", to: "/list" },
      { label: "Devices", to: "/devices" },
      { label: "Subscription", to: "/subscription" },
      { label: "Sign In", to: "/auth" },
    ],
  },
  {
    h: "Studio",
    l: [
      { label: "Press", to: "/press" },
      { label: "Careers", to: "/careers" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-border bg-surface/30 pb-10 pt-20">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-6">
            <Link to="/" className="flex items-baseline gap-1 font-display text-3xl font-bold tracking-tight">
              ORBIT<sup className="text-xs font-normal text-muted-foreground">®</sup>
            </Link>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              A cinematic streaming service for film, series and anime. Built for the dark hours, designed for the screen.
            </p>
            <div className="mt-8">
              <Link
                to="/auth"
                className="inline-block rounded-full border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-primary-foreground"
              >
                Sign In
              </Link>
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.h} className="col-span-6 md:col-span-2">
              <div className="mb-5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{c.h}</div>
              <ul className="space-y-3 text-sm">
                {c.l.map((i) => (
                  <li key={i.to + i.label}>
                    <Link to={i.to} className="text-foreground/80 transition-colors hover:text-ice">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Orbit Pictures · All rights reserved</div>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/cookies" className="hover:text-foreground">Cookie Preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
