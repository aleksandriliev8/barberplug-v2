import { useMessages } from "~/i18n/use-locale";

export const MAIN_CONTENT_ID = "main";

/** First focusable element on every page: jumps keyboard users past the header. */
export function SkipLink() {
  const t = useMessages();

  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="type-label sr-only z-[60] bg-cta px-4 py-3 text-on-cta focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      {t.skipToContent}
    </a>
  );
}
