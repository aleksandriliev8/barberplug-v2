import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderAt } from "~/test/render-at";

import * as api from "./gallery-api";
import { GalleryGrid } from "./gallery-grid";

vi.mock("./gallery-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./gallery-api")>()),
  listGallery: vi.fn(),
}));

const listGallery = vi.mocked(api.listGallery);

function photo(id: string, captionBg: string | null, captionEn: string | null): api.GalleryImage {
  return {
    id,
    captionBg,
    captionEn,
    thumbUrl: `https://cdn.test/${id}/thumb.webp`,
    thumbWidth: 720,
    thumbHeight: 900,
    largeUrl: `https://cdn.test/${id}/large.webp`,
    largeWidth: 1600,
    largeHeight: 2000,
  };
}

const PHOTOS = [photo("a", "Фейд", "Fade"), photo("b", null, null)];

describe("GalleryGrid", () => {
  beforeEach(() => {
    listGallery.mockReset();
  });

  it("shows the photos with captions in the page's language", async () => {
    listGallery.mockResolvedValue(PHOTOS);
    renderAt("/bg/gallery", GalleryGrid);

    const tile = await screen.findByRole("button", { name: "Фейд" });
    expect(tile.querySelector("img")).toHaveAttribute("src", "https://cdn.test/a/thumb.webp");
    // No caption: the button still gets a name.
    expect(screen.getByRole("button", { name: "Отвори снимка 2" })).toBeInTheDocument();
  });

  it("says so when there are no photos yet", async () => {
    listGallery.mockResolvedValue([]);
    renderAt("/en/gallery", GalleryGrid);

    expect(await screen.findByText("Photos are coming soon.")).toBeInTheDocument();
  });

  it("offers a retry when loading fails", async () => {
    const user = userEvent.setup();
    listGallery.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(PHOTOS);
    renderAt("/en/gallery", GalleryGrid);

    await user.click(await screen.findByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("button", { name: "Fade" })).toBeInTheDocument();
  });

  it("opens the lightbox, moves with the arrow keys, and returns focus on Escape", async () => {
    const user = userEvent.setup();
    listGallery.mockResolvedValue(PHOTOS);
    renderAt("/en/gallery", GalleryGrid);

    const tile = await screen.findByRole("button", { name: "Fade" });
    await user.click(tile);

    const viewer = screen.getByRole("dialog", { name: "Photo viewer" });
    expect(viewer).toHaveTextContent("1 of 2");
    expect(screen.getByRole("img", { name: "Fade" })).toHaveAttribute("src", "https://cdn.test/a/large.webp");
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(viewer).toHaveTextContent("2 of 2");
    // Uncaptioned photo falls back to the MASTER.md alt text.
    expect(screen.getByRole("img", { name: "Haircut by BarberPlug" })).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(viewer).toHaveTextContent("1 of 2"); // wraps around

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(tile).toHaveFocus();
  });

  it("keeps Tab inside the lightbox", async () => {
    const user = userEvent.setup();
    listGallery.mockResolvedValue(PHOTOS);
    renderAt("/en/gallery", GalleryGrid);
    await user.click(await screen.findByRole("button", { name: "Fade" }));

    // Close -> Previous -> Next -> back to Close.
    await user.tab();
    await user.tab();
    await user.tab();

    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });
});

describe("checkFile", () => {
  it("catches wrong types and files over 15 MB before uploading", () => {
    const jpeg = new File(["x"], "a.jpg", { type: "image/jpeg" });
    const heic = new File(["x"], "a.heic", { type: "image/heic" });
    const huge = new File(["x"], "b.png", { type: "image/png" });
    Object.defineProperty(huge, "size", { value: api.MAX_UPLOAD_BYTES + 1 });

    expect(api.checkFile(jpeg)).toBeNull();
    expect(api.checkFile(heic)).toBe("unsupported_type");
    expect(api.checkFile(huge)).toBe("too_large");
  });
});
