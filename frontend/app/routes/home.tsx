import { Link } from "react-router";

import { BookNowLink } from "~/components/book-now-link";
import { homeMeta } from "~/i18n/meta";
import { useLocale, useMessages } from "~/i18n/use-locale";

import type { Route } from "./+types/home";

export function meta({ params }: Route.MetaArgs) {
  return homeMeta(params.lang);
}

export default function Home() {
  const locale = useLocale();
  const t = useMessages();

  return (
    // TODO-CONTENT: full-bleed hero photo or video with a 40–60% black overlay.
    <section className="flex min-h-svh items-end bg-bg pt-20">
      <div className="container-page section-pad">
        <h1 className="type-heading max-w-[14ch] text-display">{t.home.headline}</h1>
        <p className="mt-6 max-w-[48ch] text-fg-muted">{t.home.subline}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <BookNowLink />
          <Link
            to={`/${locale}/learn-more`}
            className="type-label inline-flex min-h-12 items-center border border-fg px-8 py-4 transition-colors duration-200 hover:bg-fg hover:text-bg"
          >
            {t.home.learnMore}
          </Link>
        </div>
      </div>
    </section>
  );
}
