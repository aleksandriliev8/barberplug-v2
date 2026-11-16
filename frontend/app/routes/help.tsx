import { SectionPage } from "~/components/section-page";
import { sectionMeta } from "~/i18n/meta";

import type { Route } from "./+types/help";

export function meta({ params }: Route.MetaArgs) {
  return sectionMeta("help", params.lang);
}

export default function Page() {
  return <SectionPage id="help" />;
}
