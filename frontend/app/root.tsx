import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useParams,
} from "react-router";

import { NotFound } from "~/components/not-found";
import { SiteChrome } from "~/components/site-chrome";
import { DEFAULT_LOCALE, isLocale } from "~/i18n/locales";
import { useMessages } from "~/i18n/use-locale";

import type { Route } from "./+types/root";
import "./app.css";

// Oswald (headings) + Manrope (body), both with Cyrillic glyphs (MASTER.md).
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Manrope:wght@400;500;700&display=swap&subset=cyrillic,latin",
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const { lang } = useParams();
  const { pathname } = useLocation();
  // The admin area is in English for now (app/admin/messages.ts).
  const htmlLang = pathname.startsWith("/admin") ? "en" : isLocale(lang) ? lang : DEFAULT_LOCALE;

  return (
    <html lang={htmlLang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/** Shown while the SPA shell loads route code (admin pages, unknown paths): the plain black page. */
export function HydrateFallback() {
  return null;
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const t = useMessages();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <SiteChrome>
        <NotFound />
      </SiteChrome>
    );
  }

  const stack = import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <SiteChrome>
      <section className="container-page section-pad">
        <h1 className="type-heading text-h1">{t.error.title}</h1>
        <p className="mt-6 max-w-[65ch] text-fg-muted">{t.error.body}</p>
        {stack && (
          <pre className="mt-8 overflow-x-auto border border-border bg-surface p-4 text-small">
            <code>{stack}</code>
          </pre>
        )}
      </section>
    </SiteChrome>
  );
}
