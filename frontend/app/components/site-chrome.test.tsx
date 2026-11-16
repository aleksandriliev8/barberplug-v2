import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SHOP } from "~/config/shop";
import { renderAt } from "~/test/render-at";

import { SiteChrome } from "./site-chrome";

function Page() {
  return (
    <SiteChrome>
      <p>Page body</p>
    </SiteChrome>
  );
}

describe("SiteChrome", () => {
  it("prefixes every navigation link with the current Locale", () => {
    renderAt("/en/shop", Page);

    const [desktopNav] = screen.getAllByRole("navigation", { name: "Main" });
    expect(within(desktopNav).getByRole("link", { name: "Gallery" })).toHaveAttribute(
      "href",
      "/en/gallery",
    );
    expect(within(desktopNav).getByRole("link", { name: "Shop" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows Bulgarian wording under /bg", () => {
    renderAt("/bg", Page);

    expect(screen.getAllByRole("link", { name: "Галерия" })[0]).toHaveAttribute(
      "href",
      "/bg/gallery",
    );
    expect(screen.getByRole("link", { name: "Към съдържанието" })).toHaveAttribute(
      "href",
      "#main",
    );
  });

  it("opens Book Now on Fresha in a new tab", () => {
    renderAt("/en", Page);

    const [headerBookNow] = screen.getAllByRole("link", { name: /book now/i });
    expect(headerBookNow).toHaveAttribute("href", SHOP.freshaUrl);
    expect(headerBookNow).toHaveAttribute("target", "_blank");
    expect(headerBookNow).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("opens the mobile menu, makes the page inert, and closes on Escape", async () => {
    const user = userEvent.setup();
    renderAt("/en", Page);

    const menuButton = screen.getByRole("button", { name: "Open menu" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await user.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(menuButton).toHaveAccessibleName("Close menu");
    const menu = document.getElementById(menuButton.getAttribute("aria-controls")!)!;
    expect(menu).toBeVisible();
    expect(menu).toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByRole("main", { hidden: true })).toHaveAttribute("inert");

    await user.keyboard("{Escape}");

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menu).not.toBeVisible();
    expect(menuButton).toHaveFocus();
    expect(screen.getByRole("main")).not.toHaveAttribute("inert");
  });
});
