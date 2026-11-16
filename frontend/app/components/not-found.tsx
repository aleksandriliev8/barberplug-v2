import { Link } from "react-router";

import { useLocale, useMessages } from "~/i18n/use-locale";

export function NotFound() {
  const locale = useLocale();
  const t = useMessages();

  return (
    <section className="container-page section-pad">
      <p className="type-label text-fg-muted">404</p>
      <h1 className="type-heading mt-4 text-h1">{t.notFound.title}</h1>
      <p className="mt-6 max-w-[65ch] text-fg-muted">{t.notFound.body}</p>
      <Link
        to={`/${locale}`}
        className="type-label mt-10 inline-flex min-h-12 items-center border border-fg px-8 transition-colors duration-200 hover:bg-fg hover:text-bg"
      >
        {t.notFound.backHome}
      </Link>
    </section>
  );
}
