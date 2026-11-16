import { Link, useLocation } from "react-router";

import { LOCALES, switchLocalePath } from "~/i18n/locales";
import { useLocale, useMessages } from "~/i18n/use-locale";

/** BG / EN switch that keeps the visitor on the same page (ADR-0005). */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useMessages();
  const { pathname } = useLocation();

  return (
    <ul aria-label={t.switchLanguage} className={`type-label flex items-center ${className}`}>
      {LOCALES.map((target, index) => (
        <li key={target} className="flex items-center">
          {index > 0 && (
            <span aria-hidden="true" className="px-1 text-fg-muted">
              /
            </span>
          )}
          {target === locale ? (
            <span
              aria-current="true"
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-fg"
            >
              <abbr title={t.languageName[target]} className="no-underline">
                {target.toUpperCase()}
              </abbr>
            </span>
          ) : (
            <Link
              to={switchLocalePath(pathname, target)}
              lang={target}
              hrefLang={target}
              aria-label={t.languageName[target]}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-fg-muted transition-colors duration-150 hover:text-fg"
            >
              {target.toUpperCase()}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
