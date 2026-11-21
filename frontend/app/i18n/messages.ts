import type { Locale } from "./locales";
import type { SectionId } from "./sections";

/**
 * Fixed UI wording (navigation, buttons, labels). Page texts the Owner edits are
 * Editable Texts and come from the API (stage 5); the page copy here is a stand-in
 * until then. TODO-CONTENT marks wording that needs the shop's real text.
 */
type Messages = {
  siteName: string;
  skipToContent: string;
  bookNow: string;
  opensInNewTab: string;
  openMenu: string;
  closeMenu: string;
  mainNav: string;
  switchLanguage: string;
  languageName: Record<Locale, string>;
  sections: Record<SectionId, string>;
  home: { title: string; headline: string; subline: string; learnMore: string };
  pages: Record<SectionId, { lead: string }>;
  footer: {
    address: string;
    hours: string;
    phone: string;
    followUs: string;
    rights: string;
  };
  notFound: { title: string; body: string; backHome: string };
  gallery: {
    loading: string;
    empty: string;
    error: string;
    retry: string;
    viewer: string;
    openPhoto: (position: number) => string;
    close: string;
    previous: string;
    next: string;
    counter: (position: number, total: number) => string;
    /** Alt text when a photo has no caption (MASTER.md). */
    altFallback: string;
  };
  error: { title: string; body: string };
};

const en: Messages = {
  siteName: "BarberPlug",
  skipToContent: "Skip to content",
  bookNow: "Book now",
  opensInNewTab: "(opens in a new tab)",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  mainNav: "Main",
  switchLanguage: "Language",
  languageName: { bg: "Български", en: "English" },
  sections: {
    learnMore: "Learn more",
    shop: "Shop",
    gallery: "Gallery",
    location: "Location",
    help: "Help",
  },
  home: {
    title: "BarberPlug barbershop",
    headline: "Sharp cuts. No compromise.", // TODO-CONTENT
    subline: "Classic and modern haircuts and beard work.", // TODO-CONTENT
    learnMore: "Learn more",
  },
  pages: {
    learnMore: { lead: "The story of the shop and the people behind the chair." }, // TODO-CONTENT
    shop: { lead: "Grooming products are coming soon." },
    gallery: { lead: "Recent work from the shop." },
    location: { lead: "Where to find us and when we are open." },
    help: { lead: "Questions? Send us a message." },
  },
  footer: {
    address: "Address",
    hours: "Opening hours",
    phone: "Phone",
    followUs: "Follow us",
    rights: "All rights reserved.",
  },
  gallery: {
    loading: "Loading photos…",
    empty: "Photos are coming soon.",
    error: "The gallery could not be loaded.",
    retry: "Try again",
    viewer: "Photo viewer",
    openPhoto: (position) => `Open photo ${position}`,
    close: "Close",
    previous: "Previous photo",
    next: "Next photo",
    counter: (position, total) => `${position} of ${total}`,
    altFallback: "Haircut by BarberPlug",
  },
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has moved.",
    backHome: "Back to home",
  },
  error: {
    title: "Something went wrong",
    body: "Please refresh the page or try again later.",
  },
};

const bg: Messages = {
  siteName: "BarberPlug",
  skipToContent: "Към съдържанието",
  bookNow: "Запази час",
  opensInNewTab: "(отваря се в нов раздел)",
  openMenu: "Отвори менюто",
  closeMenu: "Затвори менюто",
  mainNav: "Основна навигация",
  switchLanguage: "Език",
  languageName: { bg: "Български", en: "English" },
  sections: {
    learnMore: "За нас",
    shop: "Магазин",
    gallery: "Галерия",
    location: "Локация",
    help: "Помощ",
  },
  home: {
    title: "Бръснарница BarberPlug",
    headline: "Прецизно подстригване. Без компромиси.", // TODO-CONTENT
    subline: "Класически и модерни прически и оформяне на брада.", // TODO-CONTENT
    learnMore: "Научи повече",
  },
  pages: {
    learnMore: { lead: "Историята на бръснарницата и хората зад стола." }, // TODO-CONTENT
    shop: { lead: "Продуктите за грижа идват скоро." },
    gallery: { lead: "Последната ни работа." },
    location: { lead: "Къде да ни намерите и кога работим." },
    help: { lead: "Имате въпрос? Пишете ни." },
  },
  footer: {
    address: "Адрес",
    hours: "Работно време",
    phone: "Телефон",
    followUs: "Последвайте ни",
    rights: "Всички права запазени.",
  },
  gallery: {
    loading: "Зареждане на снимките…",
    empty: "Снимките идват скоро.",
    error: "Галерията не можа да се зареди.",
    retry: "Опитай отново",
    viewer: "Преглед на снимки",
    openPhoto: (position) => `Отвори снимка ${position}`,
    close: "Затвори",
    previous: "Предишна снимка",
    next: "Следваща снимка",
    counter: (position, total) => `${position} от ${total}`,
    altFallback: "Подстригване в BarberPlug",
  },
  notFound: {
    title: "Страницата не е намерена",
    body: "Страницата, която търсите, не съществува или е преместена.",
    backHome: "Към началната страница",
  },
  error: {
    title: "Нещо се обърка",
    body: "Презаредете страницата или опитайте отново по-късно.",
  },
};

export const MESSAGES: Record<Locale, Messages> = { bg, en };
