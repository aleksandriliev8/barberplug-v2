import { describe, expect, it } from "vitest";

import { isLocale, otherLocale, switchLocalePath } from "./locales";

describe("isLocale", () => {
  it("accepts only bg and en", () => {
    expect(isLocale("bg")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("otherLocale", () => {
  it("flips between bg and en", () => {
    expect(otherLocale("bg")).toBe("en");
    expect(otherLocale("en")).toBe("bg");
  });
});

describe("switchLocalePath", () => {
  it("keeps the page and swaps the prefix", () => {
    expect(switchLocalePath("/bg/gallery", "en")).toBe("/en/gallery");
    expect(switchLocalePath("/en/learn-more", "bg")).toBe("/bg/learn-more");
  });

  it("handles the Locale home page with and without a trailing slash", () => {
    expect(switchLocalePath("/bg", "en")).toBe("/en");
    expect(switchLocalePath("/bg/", "en")).toBe("/en");
  });

  it("sends paths without a Locale to the target home page", () => {
    expect(switchLocalePath("/", "en")).toBe("/en");
    expect(switchLocalePath("/unknown/page", "bg")).toBe("/bg");
  });
});
