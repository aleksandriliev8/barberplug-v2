import { api, ApiError } from "~/lib/api";

export type Owner = { email: string };

/** The signed-in Owner, or null when nobody is signed in. */
export async function getOwner(): Promise<Owner | null> {
  try {
    return await api<Owner>("/api/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function signIn(email: string, password: string): Promise<Owner> {
  return api<Owner>("/api/auth/login", { method: "POST", body: { email, password } });
}

export function signOut(): Promise<void> {
  return api("/api/auth/logout", { method: "POST" });
}

export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return api("/api/owner/password", { method: "PUT", body: { currentPassword, newPassword } });
}

/** Only same-site admin paths are allowed as a post-login destination (no open redirect). */
export function safeNextPath(next: string | null): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}
