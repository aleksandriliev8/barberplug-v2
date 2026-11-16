import type { Config } from "@react-router/dev/config";

import { LOCALES } from "./app/i18n/locales";
import { SECTION_PATHS } from "./app/i18n/sections";

// ADR-0004: no runtime server. Public pages are prerendered per Locale into
// static HTML (served from S3 + CloudFront); anything else falls back to the SPA shell.
// `/` is deliberately NOT prerendered: its page is the redirect to `/bg`, and the
// SPA fallback is written to `index.html` only when `/` is left out. If `/` were
// prerendered, a host serving `index.html` for unknown paths would serve the
// redirect page there too, and `/bg` without a trailing slash would loop forever.
export default {
  ssr: false,
  prerender: [
    ...LOCALES.flatMap((locale) => [
      `/${locale}`,
      ...SECTION_PATHS.map((path) => `/${locale}/${path}`),
    ]),
  ],
} satisfies Config;
