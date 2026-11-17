import { RotateCw } from "lucide-react";
import { isRouteErrorResponse } from "react-router";

import { ApiError } from "~/lib/api";

import { ADMIN } from "./messages";

/** True when the backend could not be reached at all (stopped, restarting, network down). */
export function isServerUnreachable(error: unknown): boolean {
  if (error instanceof TypeError) return true; // fetch() itself failed
  if (error instanceof ApiError) return error.status === 502 || error.status === 503 || error.status === 504;
  return isRouteErrorResponse(error) && error.status >= 502 && error.status <= 504;
}

/** Error screen for admin pages, instead of the public site's error page. */
export function AdminError({ error }: { error: unknown }) {
  const t = ADMIN.error;
  const unreachable = isServerUnreachable(error);

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div role="alert" className="w-full max-w-md rounded-input border border-border bg-surface p-6 sm:p-8">
        <p className="type-heading text-xl">BarberPlug</p>
        <h1 className="type-heading mt-6 text-h2">{unreachable ? t.unreachableTitle : t.title}</h1>
        <p className="mt-3 text-small text-fg-muted">{unreachable ? t.unreachableBody : t.body}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="type-label mt-8 inline-flex min-h-12 items-center gap-2 rounded-input border border-cta bg-cta px-6 text-on-cta transition-colors duration-200 hover:bg-transparent hover:text-cta"
        >
          <RotateCw aria-hidden="true" size={16} strokeWidth={1.5} />
          {t.retry}
        </button>
      </div>
    </main>
  );
}
