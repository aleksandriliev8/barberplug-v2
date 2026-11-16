import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

import { DEFAULT_LOCALE } from "~/i18n/locales";

const TARGET = `/${DEFAULT_LOCALE}`;

// `/` is served by the SPA shell, so the router redirects once it hydrates.
// CloudFront adds a real 301 for `/` in stage 8. No meta refresh: the shell is
// also the fallback for unknown paths, and a refresh there would redirect them too.
export function meta() {
  return [{ title: "BarberPlug" }, { name: "robots", content: "noindex" }];
}

export default function RootIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(TARGET, { replace: true });
  }, [navigate]);

  return (
    <main className="container-page section-pad">
      <Link to={TARGET} className="type-label underline underline-offset-4">
        BarberPlug
      </Link>
    </main>
  );
}
