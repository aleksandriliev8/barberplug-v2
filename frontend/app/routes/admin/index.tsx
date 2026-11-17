import { redirect } from "react-router";

export function clientLoader() {
  return redirect("/admin/gallery");
}

export default function AdminIndex() {
  return null;
}
