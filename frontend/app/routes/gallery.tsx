import { SectionPage } from "~/components/section-page";
import { GalleryGrid } from "~/gallery/gallery-grid";
import { sectionMeta } from "~/i18n/meta";

import type { Route } from "./+types/gallery";

export function meta({ params }: Route.MetaArgs) {
  return sectionMeta("gallery", params.lang);
}

export default function Page() {
  return (
    <SectionPage id="gallery">
      <GalleryGrid />
    </SectionPage>
  );
}
