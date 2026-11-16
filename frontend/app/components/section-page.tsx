import type { SectionId } from "~/i18n/sections";
import { useMessages } from "~/i18n/use-locale";

/** Page title + lead. Each Section gets its real content in later stages. */
export function SectionPage({ id }: { id: SectionId }) {
  const t = useMessages();

  return (
    <section className="container-page section-pad">
      <h1 className="type-heading text-h1">{t.sections[id]}</h1>
      <p className="mt-6 max-w-[65ch] text-fg-muted">{t.pages[id].lead}</p>
    </section>
  );
}
