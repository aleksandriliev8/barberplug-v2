import { type RouteConfig, index, route } from "@react-router/dev/routes";

import { SECTIONS } from "./i18n/sections";

export default [
  // `/` sends Visitors to the default Locale (ADR-0005).
  index("routes/root-index.tsx"),

  route(":lang", "routes/locale-layout.tsx", [
    index("routes/home.tsx"),
    ...SECTIONS.map((section) => route(section.path, `routes/${section.path}.tsx`)),
    route("*", "routes/not-found.tsx", { id: "locale-not-found" }),
  ]),

  route("*", "routes/not-found.tsx", { id: "not-found" }),
] satisfies RouteConfig;
