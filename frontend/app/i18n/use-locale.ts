import { useParams } from "react-router";

import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";
import { MESSAGES } from "./messages";

/** The Locale from the `/:lang` URL segment, or the default outside localized routes. */
export function useLocale(): Locale {
  const { lang } = useParams();
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

/** Fixed UI wording for the current Locale. */
export function useMessages() {
  return MESSAGES[useLocale()];
}
