/**
 * Shop facts that change about once a year live here and change with a deploy (ADR-0008).
 * Opening Hours are not here: the Owner edits them in the admin area (stage 5).
 *
 * TODO-CONTENT: every value below is a placeholder until the shop's real details arrive.
 */
export const SHOP = {
  name: "BarberPlug",
  freshaUrl: "https://www.fresha.com/", // TODO-CONTENT: the shop's Fresha booking page
  phone: "+359 000 000 000", // TODO-CONTENT
  address: {
    bg: "ул. „Примерна“ 1, София", // TODO-CONTENT
    en: "1 Primerna St, Sofia", // TODO-CONTENT
  },
  hoursSummary: {
    bg: "Пон–Съб 10:00–20:00", // TODO-CONTENT: replaced by Opening Hours in stage 5
    en: "Mon–Sat 10:00–20:00", // TODO-CONTENT: replaced by Opening Hours in stage 5
  },
  socials: [
    { name: "Instagram", url: "https://www.instagram.com/" }, // TODO-CONTENT
  ],
} as const;
