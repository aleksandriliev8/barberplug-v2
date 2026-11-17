import { useRef, useState, type FormEvent } from "react";

import { ApiError } from "~/lib/api";

import { FormMessage, PasswordField, SubmitButton, TextField } from "./form-controls";
import { ADMIN } from "./messages";

type Props = {
  /** Signs in; throws ApiError on failure. */
  onSubmit: (email: string, password: string) => Promise<void>;
};

type FieldErrors = { email?: string; password?: string };

/** Login card content. The page decides where to go after a successful sign-in. */
export function LoginForm({ onSubmit }: Props) {
  const t = ADMIN.login;
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const errors: FieldErrors = {
      email: email.trim() ? undefined : t.emailRequired,
      password: password ? undefined : t.passwordRequired,
    };
    setFieldErrors(errors);
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordRef.current?.focus();
      return;
    }

    setBusy(true);
    try {
      await onSubmit(email, password);
    } catch (error) {
      setFormError(messageFor(error));
      setPassword("");
      passwordRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      {formError && <FormMessage tone="error">{formError}</FormMessage>}
      <TextField
        ref={emailRef}
        label={t.email}
        type="email"
        name="email"
        autoComplete="username"
        inputMode="email"
        spellCheck={false}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onBlur={() => setFieldErrors((errors) => ({ ...errors, email: email.trim() ? undefined : errors.email }))}
        error={fieldErrors.email}
      />
      <PasswordField
        ref={passwordRef}
        label={t.password}
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onBlur={() => setFieldErrors((errors) => ({ ...errors, password: password ? undefined : errors.password }))}
        error={fieldErrors.password}
      />
      <SubmitButton busy={busy} label={t.submit} busyLabel={t.submitting} className="mt-2 w-full" />
    </form>
  );
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return ADMIN.login.invalid;
    if (error.status === 429) return ADMIN.login.tooMany(Math.max(1, Math.ceil((error.retryAfter ?? 60) / 60)));
  }
  return ADMIN.login.failed;
}
