import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { TelegramBanner } from "../components/site/TelegramBanner";
import { FloatingShare } from "../components/site/FloatingShare";
import { AiConcierge } from "../components/site/AiConcierge";
import { VpnBanner } from "../components/site/VpnBanner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ORBIT — Watch Free Movies, Series & Anime Online" },
      { name: "description", content: "Stream thousands of movies, TV series and anime for free on ORBIT. No sign-up required. HD quality, updated daily." },
      { name: "author", content: "ORBIT" },
      { name: "keywords", content: "watch movies online free, free streaming, watch anime online, watch tv series free, ORBIT stream" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "ORBIT — Watch Free Movies, Series & Anime Online" },
      { property: "og:description", content: "Stream thousands of movies, TV series and anime for free on ORBIT. No sign-up required. HD quality, updated daily." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ORBIT" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@OrbitStream" },
      { name: "twitter:title", content: "ORBIT — Watch Free Movies, Series & Anime Online" },
      { name: "twitter:description", content: "Stream thousands of movies, TV series and anime for free on ORBIT." },
    ],
    scripts: [
      // Monetag ads
      { src: "https://quge5.com/88/tag.min.js", async: true, "data-zone": "253178", "data-cfasync": "false" },
      // Histats analytics — replace XXXXXXXX with your Histats site ID
      {
        children: `var _Hasync=_Hasync||[];
_Hasync.push(['Histats.start','1,XXXXXXXX,4,0,0,0,00010000']);
_Hasync.push(['Histats.fasi','1']);
_Hasync.push(['Histats.track_hits','']);
(function(){var hs=document.createElement('script');hs.type='text/javascript';hs.async=true;
hs.src='//s10.histats.com/js15_as.js';
(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(hs);})();`,
      },
      { src: "https://static.cloudflareinsights.com/beacon.min.js", defer: true, "data-cf-beacon": '{"token":"9e9f4c95643d4d7781381ea1af15629f"}' },
      // PropellerAds pop-under — replace ZONE_ID with your PropellerAds zone ID from the dashboard
      {
        children: `(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('perttelimers.net',ZONE_ID,document.createElement('script'));`,
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <TelegramBanner />
      <FloatingShare />
      <AiConcierge />
      <VpnBanner />
    </QueryClientProvider>
  );
}
