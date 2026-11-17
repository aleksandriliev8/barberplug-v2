import { changePassword } from "~/admin/auth";
import { ChangePasswordForm } from "~/admin/change-password-form";
import { ADMIN } from "~/admin/messages";

export default function AdminPassword() {
  return (
    <>
      <h1 className="type-heading text-h2">{ADMIN.password.title}</h1>
      <p className="mt-4 mb-8 max-w-[65ch] text-fg-muted">{ADMIN.password.lead}</p>
      <ChangePasswordForm onSubmit={changePassword} />
    </>
  );
}
