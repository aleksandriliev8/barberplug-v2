import { ADMIN } from "~/admin/messages";

export default function AdminTexts() {
  return (
    <>
      <h1 className="type-heading text-h2">{ADMIN.nav.texts}</h1>
      <p className="mt-4 text-fg-muted">{ADMIN.placeholder.texts}</p>
    </>
  );
}
