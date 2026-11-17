import { useRef, useState, type FormEvent } from "react";

import { ApiError } from "~/lib/api";

import { FormMessage, PasswordField, SubmitButton } from "./form-controls";
import { ADMIN } from "./messages";

const MIN_LENGTH = 12;

type Props = {
  /** Changes the password; throws ApiError with field codes on failure. */
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
};

type Field = "currentPassword" | "newPassword" | "confirm";
type Errors = Partial<Record<Field, string>>;

const FIELD_ORDER: Field[] = ["currentPassword", "newPassword", "confirm"];

function localErrors(values: Record<Field, string>): Errors {
  const e = ADMIN.password.errors;
  const errors: Errors = {};
  if (!values.currentPassword) errors.currentPassword = e.required;
  if (!values.newPassword) errors.newPassword = e.required;
  else if ([...values.newPassword].length < MIN_LENGTH) errors.newPassword = e.too_short;
  if (!values.confirm) errors.confirm = e.required;
  else if (values.confirm !== values.newPassword) errors.confirm = e.mismatch;
  return errors;
}

export function ChangePasswordForm({ onSubmit }: Props) {
  const t = ADMIN.password;
  const refs = {
    currentPassword: useRef<HTMLInputElement>(null),
    newPassword: useRef<HTMLInputElement>(null),
    confirm: useRef<HTMLInputElement>(null),
  };
  const [values, setValues] = useState<Record<Field, string>>({ currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [result, setResult] = useState<{ tone: "error" | "success"; text: string }>();
  const [busy, setBusy] = useState(false);

  function focusFirst(found: Errors) {
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) refs[first].current?.focus();
  }

  function update(field: Field, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    setResult(undefined);
    // Once a field has been left, keep its error in step with what is typed.
    if (touched[field] || errors[field]) {
      setErrors((current) => ({ ...current, [field]: localErrors(next)[field] }));
    }
  }

  function blur(field: Field) {
    setTouched((current) => ({ ...current, [field]: true }));
    if (values[field]) {
      setErrors((current) => ({ ...current, [field]: localErrors(values)[field] }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(undefined);
    const found = localErrors(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirst(found);
      return;
    }

    setBusy(true);
    try {
      await onSubmit(values.currentPassword, values.newPassword);
      setValues({ currentPassword: "", newPassword: "", confirm: "" });
      setTouched({});
      setResult({ tone: "success", text: t.saved });
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fields).length > 0) {
        const serverErrors: Errors = {};
        for (const [field, code] of Object.entries(error.fields)) {
          if (field === "currentPassword" || field === "newPassword") {
            serverErrors[field] = t.errors[code] ?? t.failed;
          }
        }
        setErrors(serverErrors);
        focusFirst(serverErrors);
      } else {
        setResult({ tone: "error", text: t.failed });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5">
      {result && <FormMessage tone={result.tone}>{result.text}</FormMessage>}
      <PasswordField
        ref={refs.currentPassword}
        label={t.current}
        name="currentPassword"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={(event) => update("currentPassword", event.target.value)}
        onBlur={() => blur("currentPassword")}
        error={errors.currentPassword}
      />
      <PasswordField
        ref={refs.newPassword}
        label={t.next}
        name="newPassword"
        autoComplete="new-password"
        value={values.newPassword}
        onChange={(event) => update("newPassword", event.target.value)}
        onBlur={() => blur("newPassword")}
        error={errors.newPassword}
      />
      <PasswordField
        ref={refs.confirm}
        label={t.confirm}
        name="confirm"
        autoComplete="new-password"
        value={values.confirm}
        onChange={(event) => update("confirm", event.target.value)}
        onBlur={() => blur("confirm")}
        error={errors.confirm}
      />
      <SubmitButton busy={busy} label={t.submit} busyLabel={t.submitting} className="mt-2 self-start" />
    </form>
  );
}
