import { Link } from "react-router";

import { useLocale, useMessages } from "~/i18n/use-locale";

/** Text wordmark until the shop's logo file arrives. TODO-CONTENT: real logo (SVG). */
export function Logo({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useMessages();

  return (
    <Link
      to={`/${locale}`}
      className={`type-heading inline-flex min-h-11 shrink-0 items-center text-xl tracking-wider transition-opacity duration-150 hover:opacity-80 md:text-2xl ${className}`}
    >
      {t.siteName}
    </Link>
  );
}
