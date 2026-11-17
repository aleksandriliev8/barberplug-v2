import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, ApiError } from "./api";

function clearCookies() {
  for (const part of document.cookie.split("; ")) {
    const name = part.split("=")[0];
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("api", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    clearCookies();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("sends the CSRF cookie back in the X-XSRF-TOKEN header on changes", async () => {
    document.cookie = "XSRF-TOKEN=abc123; path=/";
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await api("/api/owner/password", { method: "PUT", body: { a: 1 } });

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.headers).toMatchObject({ "X-XSRF-TOKEN": "abc123", "Content-Type": "application/json" });
    expect(init?.credentials).toBe("same-origin");
    expect(init?.body).toBe('{"a":1}');
  });

  it("asks the backend for a CSRF cookie first when there is none", async () => {
    fetchMock.mockImplementation(async (input) => {
      if (input === "/api/auth/csrf") {
        document.cookie = "XSRF-TOKEN=fresh; path=/";
        return new Response(null, { status: 204 });
      }
      return json(200, { email: "owner@test.local" });
    });

    const owner = await api<{ email: string }>("/api/auth/login", { method: "POST", body: {} });

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["/api/auth/csrf", "/api/auth/login"]);
    expect(fetchMock.mock.calls[1][1]?.headers).toMatchObject({ "X-XSRF-TOKEN": "fresh" });
    expect(owner.email).toBe("owner@test.local");
  });

  it("does not send a CSRF header on reads", async () => {
    fetchMock.mockResolvedValue(json(200, { email: "x" }));

    await api("/api/auth/me");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty("X-XSRF-TOKEN");
  });

  it("turns error responses into ApiError with the backend's codes", async () => {
    document.cookie = "XSRF-TOKEN=t; path=/";
    fetchMock.mockResolvedValue(json(429, { error: "too_many_attempts" }, { "Retry-After": "120" }));

    const error = await api("/api/auth/login", { method: "POST", body: {} }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, code: "too_many_attempts", retryAfter: 120 });
  });

  it("copes with error responses that have no body", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const error = await api("/api/auth/me").catch((e) => e);

    expect(error).toMatchObject({ status: 401, code: "http_401", fields: {} });
  });
});
