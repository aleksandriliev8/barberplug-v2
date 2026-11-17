import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "~/lib/api";

import { LoginForm } from "./login-form";
import { ADMIN } from "./messages";
import { safeNextPath } from "./auth";

function setup(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={onSubmit} />);
  return {
    user,
    onSubmit,
    email: screen.getByLabelText("Email"),
    password: screen.getByLabelText("Password"),
    submit: screen.getByRole("button", { name: "Sign in" }),
  };
}

describe("LoginForm", () => {
  it("asks for missing fields and focuses the first one", async () => {
    const { user, submit, email, onSubmit } = setup();

    await user.click(submit);

    expect(screen.getByText(ADMIN.login.emailRequired)).toBeInTheDocument();
    expect(email).toHaveFocus();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits email and password", async () => {
    const { user, submit, email, password, onSubmit } = setup();

    await user.type(email, "owner@test.local");
    await user.type(password, "correct-horse-battery");
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledWith("owner@test.local", "correct-horse-battery");
  });

  it("shows one generic message for wrong credentials and clears the password", async () => {
    const { user, submit, email, password } = setup(vi.fn().mockRejectedValue(new ApiError(401, "invalid_credentials")));

    await user.type(email, "owner@test.local");
    await user.type(password, "wrong");
    await user.click(submit);

    expect(await screen.findByRole("alert")).toHaveTextContent(ADMIN.login.invalid);
    expect(password).toHaveValue("");
    expect(password).toHaveFocus();
  });

  it("tells the Owner how long to wait after too many attempts", async () => {
    const { user, submit, email, password } = setup(
      vi.fn().mockRejectedValue(new ApiError(429, "too_many_attempts", {}, 600)),
    );

    await user.type(email, "owner@test.local");
    await user.type(password, "x");
    await user.click(submit);

    expect(await screen.findByRole("alert")).toHaveTextContent("Try again in 10 minutes.");
  });

  it("can show the password while typing", async () => {
    const { user, password } = setup();

    expect(password).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: ADMIN.login.showPassword }));

    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: ADMIN.login.hidePassword })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("safeNextPath", () => {
  it("only allows admin paths as the destination after sign-in", () => {
    expect(safeNextPath("/admin/password")).toBe("/admin/password");
    expect(safeNextPath("https://evil.example")).toBe("/admin");
    expect(safeNextPath("//evil.example/admin")).toBe("/admin");
    expect(safeNextPath(null)).toBe("/admin");
  });
});
