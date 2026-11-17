import { type RouteConfig, index, route } from "@react-router/dev/routes";

import { SECTIONS } from "./i18n/sections";

export default [
  // `/` sends Visitors to the default Locale (ADR-0005).
  index("routes/root-index.tsx"),

  // Admin area: not prerendered, served by the SPA shell, needs a signed-in Owner (ADR-0006).
  route("admin/login", "routes/admin/login.tsx"),
  route("admin", "routes/admin/layout.tsx", [
    index("routes/admin/index.tsx"),
    route("gallery", "routes/admin/gallery.tsx"),
    route("texts", "routes/admin/texts.tsx"),
    route("password", "routes/admin/password.tsx"),
  ]),

  route(":lang", "routes/locale-layout.tsx", [
    index("routes/home.tsx"),
    ...SECTIONS.map((section) => route(section.path, `routes/${section.path}.tsx`)),
    route("*", "routes/not-found.tsx", { id: "locale-not-found" }),
  ]),

  route("*", "routes/not-found.tsx", { id: "not-found" }),
] satisfies RouteConfig;
