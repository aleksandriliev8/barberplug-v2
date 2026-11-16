import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "~/test/render-at";

import { LanguageSwitcher } from "./language-switcher";

describe("LanguageSwitcher", () => {
  it("links to the same page in the other Locale", () => {
    renderAt("/bg/gallery", LanguageSwitcher);

    const english = screen.getByRole("link", { name: "English" });
    expect(english).toHaveAttribute("href", "/en/gallery");
    expect(english).toHaveAttribute("hreflang", "en");
  });

  it("marks the current Locale and does not link to it", () => {
    renderAt("/en/help", LanguageSwitcher);

    expect(screen.queryByRole("link", { name: "English" })).not.toBeInTheDocument();
    expect(screen.getByText("EN").closest("[aria-current]")).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Български" })).toHaveAttribute("href", "/bg/help");
  });
});
