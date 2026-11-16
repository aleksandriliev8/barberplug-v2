/** A Locale is the language a page is shown in (see GLOSSARY.md). */
export const LOCALES = ["bg", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "bg";

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "bg" ? "en" : "bg";
}

/**
 * Same page in another Locale: swaps the `/bg` or `/en` prefix and keeps the rest (ADR-0005).
 * A path without a Locale prefix goes to that Locale's home page.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const [, first, ...rest] = pathname.split("/");
  if (!isLocale(first)) {
    return `/${target}`;
  }
  const tail = rest.join("/");
  return tail ? `/${target}/${tail}` : `/${target}`;
}
