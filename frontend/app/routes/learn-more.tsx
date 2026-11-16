import { SectionPage } from "~/components/section-page";
import { sectionMeta } from "~/i18n/meta";

import type { Route } from "./+types/learn-more";

export function meta({ params }: Route.MetaArgs) {
  return sectionMeta("learnMore", params.lang);
}

export default function Page() {
  return <SectionPage id="learnMore" />;
}
