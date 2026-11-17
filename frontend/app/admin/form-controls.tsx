import { Eye, EyeOff, Loader2 } from "lucide-react";
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { ADMIN } from "./messages";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  error?: string;
  hint?: string;
};

const inputClass =
  "min-h-11 w-full rounded-input border bg-surface px-3 text-body text-fg transition-colors duration-150 " +
  "placeholder:text-fg-muted hover:border-fg-muted aria-[invalid=true]:border-danger";

/** Label above the input, hint and error below it (MASTER.md: never placeholder-only labels). */
export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, error, hint, className = "", ...input },
  ref,
) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-small font-medium text-fg">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${inputClass} border-border`}
        {...input}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
});

/** Password input with a show/hide toggle. */
export const PasswordField = forwardRef<HTMLInputElement, FieldProps>(function PasswordField(
  { label, error, hint, className = "", ...input },
  ref,
) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-small font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} border-border pr-12`}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? ADMIN.login.hidePassword : ADMIN.login.showPassword}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-input text-fg-muted transition-colors duration-150 hover:text-fg"
        >
          {visible ? (
            <EyeOff aria-hidden="true" size={20} strokeWidth={1.5} />
          ) : (
            <Eye aria-hidden="true" size={20} strokeWidth={1.5} />
          )}
        </button>
      </div>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
});

function FieldMessages({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-small text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-small text-danger">
          {error}
        </p>
      )}
    </>
  );
}

type SubmitProps = {
  busy: boolean;
  label: string;
  busyLabel: string;
  className?: string;
};

/** Primary button that shows a spinner and is disabled while the request runs. */
export function SubmitButton({ busy, label, busyLabel, className = "" }: SubmitProps) {
  return (
    <button
      type="submit"
      disabled={busy}
      aria-busy={busy}
      className={`type-label inline-flex min-h-12 items-center justify-center gap-2 rounded-input border border-cta bg-cta px-6 text-on-cta transition-colors duration-200 hover:bg-transparent hover:text-cta disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-cta disabled:hover:text-on-cta ${className}`}
    >
      {busy && <Loader2 aria-hidden="true" size={16} strokeWidth={1.5} className="animate-spin" />}
      {busy ? busyLabel : label}
    </button>
  );
}

/** Form-level message: errors are announced right away, successes politely. */
export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-input border px-4 py-3 text-small ${
        tone === "error" ? "border-danger text-danger" : "border-success text-success"
      }`}
    >
      {children}
    </p>
  );
}
