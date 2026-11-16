import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { MAIN_CONTENT_ID, SkipLink } from "./skip-link";

type Props = {
  children: ReactNode;
  /** Home page: no top padding, the hero sits under the transparent header. */
  overHero?: boolean;
};

/** Skip link, header, main landmark and footer shared by every public page. */
export function SiteChrome({ children, overHero = false }: Props) {
  return (
    <>
      <SkipLink />
      <SiteHeader overHero={overHero} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={`outline-none ${overHero ? "" : "pt-20"}`}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
