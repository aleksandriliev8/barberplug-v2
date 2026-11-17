import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "~/lib/api";

import { ChangePasswordForm } from "./change-password-form";
import { ADMIN } from "./messages";

const e = ADMIN.password.errors;

function setup(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const user = userEvent.setup();
  render(<ChangePasswordForm onSubmit={onSubmit} />);
  return {
    user,
    onSubmit,
    current: screen.getByLabelText(ADMIN.password.current),
    next: screen.getByLabelText(ADMIN.password.next),
    confirm: screen.getByLabelText(ADMIN.password.confirm),
    submit: screen.getByRole("button", { name: ADMIN.password.submit }),
  };
}

describe("ChangePasswordForm", () => {
  it("checks length and the repeated password before sending", async () => {
    const { user, current, next, confirm, submit, onSubmit } = setup();

    await user.type(current, "old-password-123");
    await user.type(next, "short");
    await user.type(confirm, "different");
    await user.click(submit);

    expect(screen.getByText(e.too_short)).toBeInTheDocument();
    expect(screen.getByText(e.mismatch)).toBeInTheDocument();
    expect(next).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows an error when leaving a field with a too-short password", async () => {
    const { user, next } = setup();

    await user.type(next, "short");
    await user.tab();

    expect(screen.getByText(e.too_short)).toBeInTheDocument();
  });

  it("sends the passwords and confirms the change", async () => {
    const { user, current, next, confirm, submit, onSubmit } = setup();

    await user.type(current, "old-password-123");
    await user.type(next, "a-brand-new-password");
    await user.type(confirm, "a-brand-new-password");
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledWith("old-password-123", "a-brand-new-password");
    expect(await screen.findByRole("status")).toHaveTextContent(ADMIN.password.saved);
    expect(current).toHaveValue("");
  });

  it("puts the backend's field errors next to the right field", async () => {
    const { user, current, next, confirm, submit } = setup(
      vi.fn().mockRejectedValue(new ApiError(400, "validation_failed", { currentPassword: "incorrect" })),
    );

    await user.type(current, "not-my-password");
    await user.type(next, "a-brand-new-password");
    await user.type(confirm, "a-brand-new-password");
    await user.click(submit);

    expect(await screen.findByText(e.incorrect)).toBeInTheDocument();
    expect(current).toHaveFocus();
  });
});
