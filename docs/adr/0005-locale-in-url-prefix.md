# Locale lives in the URL prefix

Every public page exists under `/bg/...` and `/en/...`, with `/` redirecting to `/bg`. Slugs are English under both prefixes (`/bg/gallery`, `/en/gallery`) to keep routing simple; translated slugs were rejected as not worth the extra mapping for six Sections. Each page links its other-Locale version with `hreflang`. Cookie- or header-based language switching was rejected because it hides one Locale from search engines.
