import type { ReactNode } from "react";

import type { SectionId } from "~/i18n/sections";
import { useMessages } from "~/i18n/use-locale";

/** Page title + lead, then the Section's own content. */
export function SectionPage({ id, children }: { id: SectionId; children?: ReactNode }) {
  const t = useMessages();

  return (
    <section className="container-page section-pad">
      <h1 className="type-heading text-h1">{t.sections[id]}</h1>
      <p className="mt-6 max-w-[65ch] text-fg-muted">{t.pages[id].lead}</p>
      {children && <div className="mt-12 lg:mt-16">{children}</div>}
    </section>
  );
}
