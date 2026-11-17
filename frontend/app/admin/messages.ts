/**
 * Admin area wording. English for now; kept in one place so a Bulgarian version is a
 * matter of adding a second dictionary.
 */
export const ADMIN = {
  title: "BarberPlug admin",
  loading: "Loading…",
  nav: {
    label: "Admin",
    gallery: "Gallery",
    texts: "Texts",
    password: "Password",
    signOut: "Log out",
    viewSite: "View site",
  },
  login: {
    title: "Sign in",
    lead: "Owner access to the BarberPlug admin area.",
    email: "Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    submit: "Sign in",
    submitting: "Signing in…",
    required: "Enter your email and password.",
    emailRequired: "Enter your email.",
    passwordRequired: "Enter your password.",
    invalid: "That email and password don't match. Check them and try again.",
    tooMany: (minutes: number) =>
      `Too many attempts. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`,
    failed: "Sign-in is not available right now. Try again in a moment.",
  },
  password: {
    title: "Change password",
    lead: "Use at least 12 characters. A few unrelated words make a strong password.",
    current: "Current password",
    next: "New password",
    confirm: "Repeat new password",
    submit: "Change password",
    submitting: "Saving…",
    saved: "Password changed.",
    failed: "The password could not be changed. Try again in a moment.",
    errors: {
      required: "This field is required.",
      incorrect: "This is not your current password.",
      too_short: "Use at least 12 characters.",
      too_long: "This password is too long.",
      same_as_current: "Choose a password different from the current one.",
      mismatch: "The two new passwords don't match.",
    } as Record<string, string>,
  },
  error: {
    title: "Something went wrong",
    body: "The admin page could not be loaded. Try again; if it keeps happening, the server log has the details.",
    unreachableTitle: "Server not reachable",
    unreachableBody:
      "The admin area could not reach the backend. It may be restarting. In development, check that the backend is running on port 8080.",
    retry: "Try again",
  },
  placeholder: {
    gallery: "The Gallery manager arrives in stage 4.",
    texts: "Editable Texts and Opening Hours arrive in stage 5.",
  },
} as const;
