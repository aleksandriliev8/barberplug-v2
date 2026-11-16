import { ArrowUpRight } from "lucide-react";

import { SHOP } from "~/config/shop";
import { useMessages } from "~/i18n/use-locale";

type Props = {
  /** `compact` fits the header bar; `default` is the full-size primary button. */
  size?: "default" | "compact";
  variant?: "primary" | "secondary";
  className?: string;
};

/** The one primary action everywhere: opens the shop's Fresha page in a new tab (ADR-0001). */
export function BookNowLink({ size = "default", variant = "primary", className = "" }: Props) {
  const t = useMessages();
  const sizing = size === "compact" ? "min-h-11 px-3 sm:px-4" : "min-h-12 px-8 py-4";
  const look =
    variant === "primary"
      ? "border-cta bg-cta text-on-cta hover:bg-transparent hover:text-cta"
      : "border-fg bg-transparent text-fg hover:bg-fg hover:text-bg";

  return (
    <a
      href={SHOP.freshaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`type-label inline-flex shrink-0 items-center justify-center gap-2 border whitespace-nowrap transition-colors duration-200 ${sizing} ${look} ${className}`}
    >
      {t.bookNow}
      <ArrowUpRight
        aria-hidden="true"
        size={16}
        strokeWidth={1.5}
        className={size === "compact" ? "hidden sm:block" : undefined}
      />
      <span className="sr-only">{t.opensInNewTab}</span>
    </a>
  );
}
