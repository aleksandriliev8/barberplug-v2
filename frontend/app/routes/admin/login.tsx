import { redirect, useNavigate, useSearchParams } from "react-router";

import { getOwner, safeNextPath, signIn } from "~/admin/auth";
import { LoginForm } from "~/admin/login-form";
import { AdminError } from "~/admin/admin-error";
import { ADMIN } from "~/admin/messages";

import type { Route } from "./+types/login";

/** Already signed in: skip the form. */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  if (await getOwner()) {
    throw redirect(safeNextPath(new URL(request.url).searchParams.get("next")));
  }
  return null;
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
  return [{ title: `${ADMIN.login.title} | ${ADMIN.title}` }, { name: "robots", content: "noindex, nofollow" }];
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function handleSubmit(email: string, password: string) {
    await signIn(email, password);
    navigate(safeNextPath(params.get("next")), { replace: true });
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-input border border-border bg-surface p-6 shadow-[0_1px_2px_rgb(0_0_0/0.3)] sm:p-8">
        <p className="type-heading text-xl">BarberPlug</p>
        <h1 className="type-heading mt-6 text-h2">{ADMIN.login.title}</h1>
        <p className="mt-2 mb-8 text-small text-fg-muted">{ADMIN.login.lead}</p>
        <LoginForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
