import { SectionPage } from "~/components/section-page";
import { sectionMeta } from "~/i18n/meta";

import type { Route } from "./+types/shop";

export function meta({ params }: Route.MetaArgs) {
  return sectionMeta("shop", params.lang);
}

export default function Page() {
  return <SectionPage id="shop" />;
}
