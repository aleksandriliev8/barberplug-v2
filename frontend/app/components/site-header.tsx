import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router";

import { SECTIONS } from "~/i18n/sections";
import { useLocale, useMessages } from "~/i18n/use-locale";

import { BookNowLink } from "./book-now-link";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { MAIN_CONTENT_ID } from "./skip-link";

/** Scroll distance after which the header turns solid over the hero. */
const SOLID_AFTER_PX = 80;

type Props = {
  /** True on the home page: the header starts transparent over the hero. */
  overHero?: boolean;
};

export function SiteHeader({ overHero = false }: Props) {
  const locale = useLocale();
  const t = useMessages();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overHero) return;
    const update = () => setScrolled(window.scrollY > SOLID_AFTER_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [overHero]);

  // A navigation always closes the menu.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // While the menu is open: lock page scroll, make the page behind it inert,
  // move focus into the menu, and close on Escape (focus returns to the button).
  useEffect(() => {
    if (!menuOpen) return;
    const behind = [document.getElementById(MAIN_CONTENT_ID), document.querySelector("footer")];
    behind.forEach((element) => element?.setAttribute("inert", ""));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      behind.forEach((element) => element?.removeAttribute("inert"));
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const solid = !overHero || scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-250 ${
        solid ? "border-b border-border bg-bg" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between gap-3">
        <Logo />

        <nav aria-label={t.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <NavLink
                  to={`/${locale}/${section.path}`}
                  className={({ isActive }) =>
                    `type-label inline-flex min-h-11 items-center border-b transition-colors duration-150 ${
                      isActive
                        ? "border-fg text-fg"
                        : "border-transparent text-fg-muted hover:text-fg"
                    }`
                  }
                >
                  {t.sections[section.id]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-6">
          <LanguageSwitcher className="hidden lg:flex" />
          <BookNowLink size="compact" />
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-11 shrink-0 items-center justify-center text-fg transition-colors duration-150 hover:bg-surface-2 lg:hidden"
          >
            {menuOpen ? (
              <X aria-hidden="true" size={24} strokeWidth={1.5} />
            ) : (
              <Menu aria-hidden="true" size={24} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Full-screen menu under 1024px. The header bar (with Book Now) stays visible above it. */}
      <div
        ref={menuRef}
        id={menuId}
        hidden={!menuOpen}
        className="fixed inset-x-0 top-20 bottom-0 overflow-y-auto bg-bg lg:hidden"
      >
        <nav aria-label={t.mainNav} className="container-page flex min-h-full flex-col py-8">
          <ul className="flex flex-col">
            {SECTIONS.map((section) => (
              <li key={section.id} className="border-b border-border">
                <NavLink
                  to={`/${locale}/${section.path}`}
                  className={({ isActive }) =>
                    `type-heading flex min-h-16 items-center text-h2 transition-colors duration-150 ${
                      isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                    }`
                  }
                >
                  {t.sections[section.id]}
                </NavLink>
              </li>
            ))}
          </ul>
          <LanguageSwitcher className="mt-8 -ml-3" />
        </nav>
      </div>
    </header>
  );
}
