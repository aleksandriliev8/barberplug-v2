import { ExternalLink, Images, KeyRound, LogOut, Type } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, redirect, useNavigate } from "react-router";

import { getOwner, signOut } from "~/admin/auth";
import { AdminError } from "~/admin/admin-error";
import { ADMIN } from "~/admin/messages";

import type { Route } from "./+types/layout";

/** Every admin page needs a signed-in Owner; otherwise go to the login page and come back after. */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const owner = await getOwner();
  if (!owner) {
    const url = new URL(request.url);
    throw redirect(`/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return { owner };
}

export function HydrateFallback() {
  return (
    <p role="status" className="p-8 text-small text-fg-muted">
      {ADMIN.loading}
    </p>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AdminError error={error} />;
}

export function meta() {
  return [{ title: ADMIN.title }, { name: "robots", content: "noindex, nofollow" }];
}

const LINKS = [
  { to: "/admin/gallery", label: ADMIN.nav.gallery, Icon: Images },
  { to: "/admin/texts", label: ADMIN.nav.texts, Icon: Type },
  { to: "/admin/password", label: ADMIN.nav.password, Icon: KeyRound },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center gap-3 rounded-input px-3 text-small font-medium transition-colors duration-150 ${
    isActive ? "bg-surface-2 text-fg" : "text-fg-muted hover:bg-surface hover:text-fg"
  }`;

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      navigate("/admin/login", { replace: true });
    }
  }

  return (
    <div className="min-h-svh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-border bg-bg md:sticky md:top-0 md:flex md:h-svh md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-4 px-4 py-4 md:block md:px-5 md:py-6">
          <p className="type-heading text-xl">BarberPlug</p>
          <p className="truncate text-small text-fg-muted md:mt-1">{loaderData.owner.email}</p>
        </div>
        <nav aria-label={ADMIN.nav.label} className="px-2 pb-2 md:flex-1 md:px-3">
          <ul className="flex gap-1 overflow-x-auto md:flex-col">
            {LINKS.map(({ to, label, Icon }) => (
              <li key={to} className="shrink-0">
                <NavLink to={to} className={linkClass}>
                  <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex gap-1 border-t border-border px-2 py-2 md:flex-col md:px-3 md:py-4">
          <a href="/bg" target="_blank" rel="noopener noreferrer" className={linkClass({ isActive: false })}>
            <ExternalLink aria-hidden="true" size={20} strokeWidth={1.5} />
            {ADMIN.nav.viewSite}
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className={`${linkClass({ isActive: false })} disabled:opacity-70`}
          >
            <LogOut aria-hidden="true" size={20} strokeWidth={1.5} />
            {ADMIN.nav.signOut}
          </button>
        </div>
      </aside>
      <main id="main" tabIndex={-1} className="px-4 py-8 outline-none md:px-10 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
