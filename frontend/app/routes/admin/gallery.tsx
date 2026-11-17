import { ADMIN } from "~/admin/messages";

export default function AdminGallery() {
  return (
    <>
      <h1 className="type-heading text-h2">{ADMIN.nav.gallery}</h1>
      <p className="mt-4 text-fg-muted">{ADMIN.placeholder.gallery}</p>
    </>
  );
}
