import { GalleryManager } from "~/admin/gallery/gallery-manager";
import { ADMIN } from "~/admin/messages";
import { listGallery } from "~/gallery/gallery-api";

import type { Route } from "./+types/gallery";

export async function clientLoader() {
  return { images: await listGallery() };
}

export default function AdminGallery({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1 className="type-heading text-h2">{ADMIN.nav.gallery}</h1>
      <p className="mt-4 mb-8 max-w-[65ch] text-fg-muted">{ADMIN.gallery.lead}</p>
      <GalleryManager initialImages={loaderData.images} />
    </>
  );
}
