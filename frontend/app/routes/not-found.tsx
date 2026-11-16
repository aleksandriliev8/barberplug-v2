import { useParams } from "react-router";

import { NotFound } from "~/components/not-found";
import { SiteChrome } from "~/components/site-chrome";
import { isLocale } from "~/i18n/locales";

export function meta() {
  return [{ title: "404 | BarberPlug" }, { name: "robots", content: "noindex" }];
}

/** Used twice in routes.ts: inside `/:lang` (the layout already draws the chrome) and at the top level. */
export default function NotFoundRoute() {
  const { lang } = useParams();
  return isLocale(lang) ? (
    <NotFound />
  ) : (
    <SiteChrome>
      <NotFound />
    </SiteChrome>
  );
}
