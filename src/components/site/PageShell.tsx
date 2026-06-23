import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <main className="pt-28">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative border-b border-border">
      <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-10 md:py-24">
        <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-px w-8 bg-ice/60" />
          {eyebrow}
        </div>
        <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl md:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
