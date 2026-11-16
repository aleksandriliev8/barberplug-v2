import { SectionPage } from "~/components/section-page";
import { sectionMeta } from "~/i18n/meta";

import type { Route } from "./+types/location";

export function meta({ params }: Route.MetaArgs) {
  return sectionMeta("location", params.lang);
}

export default function Page() {
  return <SectionPage id="location" />;
}
