import { Outlet, useLocation } from "react-router";

import { NotFound } from "~/components/not-found";
import { SiteChrome } from "~/components/site-chrome";
import { isLocale } from "~/i18n/locales";

import type { Route } from "./+types/locale-layout";

export default function LocaleLayout({ params }: Route.ComponentProps) {
  const { pathname } = useLocation();

  // `/xx/...` with an unknown Locale is a missing page, not a third language.
  if (!isLocale(params.lang)) {
    return (
      <SiteChrome>
        <NotFound />
      </SiteChrome>
    );
  }

  const isHome = pathname.replace(/\/$/, "") === `/${params.lang}`;

  return (
    <SiteChrome overHero={isHome}>
      <Outlet />
    </SiteChrome>
  );
}
