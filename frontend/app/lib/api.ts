/**
 * Calls to the backend under /api. Same origin, so the browser sends the session cookie itself.
 * Requests that change something carry the CSRF token: the backend sets it in the readable
 * XSRF-TOKEN cookie and expects it back in the X-XSRF-TOKEN header (ADR-0006).
 */

const CSRF_COOKIE = "XSRF-TOKEN";
export const CSRF_HEADER = "X-XSRF-TOKEN";

/** A failed API call. `code` and `fields` are the backend's stable error codes. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly fields: Record<string, string> = {},
    /** Seconds to wait, from the Retry-After header (429 only). */
    readonly retryAfter?: number,
  ) {
    super(`API ${status}: ${code}`);
    this.name = "ApiError";
  }
}

export function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  const match = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : undefined;
}

/** The CSRF token, fetching the cookie first if the browser has none yet. */
export async function ensureCsrfToken(): Promise<string | undefined> {
  if (!readCookie(CSRF_COOKIE)) {
    await fetch("/api/auth/csrf", { credentials: "same-origin" });
  }
  return readCookie(CSRF_COOKIE);
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function api<T = void>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (method !== "GET") {
    const token = await ensureCsrfToken();
    if (token) {
      headers[CSRF_HEADER] = token;
    }
  }

  const response = await fetch(path, {
    method,
    headers,
    credentials: "same-origin",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let payload: { error?: string; fields?: Record<string, string> } = {};
    try {
      payload = await response.json();
    } catch {
      // No JSON body (for example a bare 401 or 403).
    }
    const retryAfter = Number(response.headers.get("Retry-After")) || undefined;
    throw new ApiError(response.status, payload.error ?? `http_${response.status}`, payload.fields, retryAfter);
  }

  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return undefined as T;
  }
  return (await response.json()) as T;
}
