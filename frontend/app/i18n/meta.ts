import type { MetaDescriptor } from "react-router";

import { DEFAULT_LOCALE, isLocale } from "./locales";
import { MESSAGES } from "./messages";
import type { SectionId } from "./sections";

function messagesFor(lang: string | undefined) {
  return MESSAGES[isLocale(lang) ? lang : DEFAULT_LOCALE];
}

/** `<title>` and description for a Section page. Full SEO tags come in stage 7. */
export function sectionMeta(id: SectionId, lang: string | undefined): MetaDescriptor[] {
  const t = messagesFor(lang);
  return [
    { title: `${t.sections[id]} | ${t.siteName}` },
    { name: "description", content: t.pages[id].lead },
  ];
}

export function homeMeta(lang: string | undefined): MetaDescriptor[] {
  const t = messagesFor(lang);
  return [{ title: t.home.title }, { name: "description", content: t.home.subline }];
}
