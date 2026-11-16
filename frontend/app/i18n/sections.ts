/**
 * The public Sections (see GLOSSARY.md), in navigation order.
 * Book Now is not here: it is an external link to Fresha (ADR-0001).
 * Slugs are English under both Locales (ADR-0005).
 */
export const SECTIONS = [
  { id: "learnMore", path: "learn-more" },
  { id: "shop", path: "shop" },
  { id: "gallery", path: "gallery" },
  { id: "location", path: "location" },
  { id: "help", path: "help" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const SECTION_PATHS = SECTIONS.map((section) => section.path);
