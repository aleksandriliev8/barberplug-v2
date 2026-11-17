import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApiError } from "~/lib/api";

import { AdminError, isServerUnreachable } from "./admin-error";
import { ADMIN } from "./messages";

describe("isServerUnreachable", () => {
  it("recognises a stopped backend behind the proxy and a failed fetch", () => {
    expect(isServerUnreachable(new ApiError(502, "http_502"))).toBe(true);
    expect(isServerUnreachable(new ApiError(503, "http_503"))).toBe(true);
    expect(isServerUnreachable(new TypeError("Failed to fetch"))).toBe(true);
  });

  it("does not treat other failures as unreachable", () => {
    expect(isServerUnreachable(new ApiError(500, "http_500"))).toBe(false);
    expect(isServerUnreachable(new Error("bug"))).toBe(false);
  });
});

describe("AdminError", () => {
  it("explains a backend that cannot be reached", () => {
    render(<AdminError error={new ApiError(502, "http_502")} />);

    expect(screen.getByRole("heading", { name: ADMIN.error.unreachableTitle })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ADMIN.error.retry })).toBeInTheDocument();
  });

  it("falls back to a general message for other errors", () => {
    render(<AdminError error={new Error("bug")} />);

    expect(screen.getByRole("heading", { name: ADMIN.error.title })).toBeInTheDocument();
  });
});
