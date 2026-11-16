import { SHOP } from "~/config/shop";
import { useLocale, useMessages } from "~/i18n/use-locale";

import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

export function SiteFooter() {
  const locale = useLocale();
  const t = useMessages();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page section-pad grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
        </div>

        <dl className="grid gap-6 text-small md:col-span-1 lg:col-span-2 lg:grid-cols-3">
          <div>
            <dt className="type-label mb-2 text-fg-muted">{t.footer.address}</dt>
            <dd>{SHOP.address[locale]}</dd>
          </div>
          <div>
            <dt className="type-label mb-2 text-fg-muted">{t.footer.hours}</dt>
            <dd>{SHOP.hoursSummary[locale]}</dd>
          </div>
          <div>
            <dt className="type-label mb-2 text-fg-muted">{t.footer.phone}</dt>
            <dd>
              <a
                href={`tel:${SHOP.phone.replace(/\s/g, "")}`}
                className="-my-3 inline-block py-3 underline-offset-4 transition-colors duration-150 hover:underline"
              >
                {SHOP.phone}
              </a>
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-4">
          <p className="type-label text-fg-muted">{t.footer.followUs}</p>
          <ul className="flex flex-wrap gap-4 text-small">
            {SHOP.socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-my-3 inline-block py-3 underline-offset-4 transition-colors duration-150 hover:underline"
                >
                  {social.name}
                  <span className="sr-only"> {t.opensInNewTab}</span>
                </a>
              </li>
            ))}
          </ul>
          <LanguageSwitcher className="-ml-3" />
        </div>
      </div>

      <div className="border-t border-border">
        <p className="container-page py-6 text-small text-fg-muted">
          © {year} {SHOP.name}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
