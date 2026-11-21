import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "~/gallery/gallery-api";

import { ADMIN } from "../messages";
import { GalleryManager } from "./gallery-manager";

vi.mock("~/gallery/gallery-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("~/gallery/gallery-api")>()),
  saveOrder: vi.fn(),
  deleteImage: vi.fn(),
  updateCaptions: vi.fn(),
  uploadImage: vi.fn(),
}));

const mocked = vi.mocked(api);
const t = ADMIN.gallery;

function photo(id: string): api.GalleryImage {
  return {
    id,
    captionBg: null,
    captionEn: null,
    thumbUrl: `https://cdn.test/${id}.webp`,
    thumbWidth: 720,
    thumbHeight: 900,
    largeUrl: `https://cdn.test/${id}-large.webp`,
    largeWidth: 1600,
    largeHeight: 2000,
  };
}

function cards() {
  return within(screen.getByRole("region", { name: /photo/ }))
    .getAllByRole("listitem")
    .map((card) => card.querySelector("img")?.getAttribute("src"));
}

describe("GalleryManager", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("moves a photo with the arrow buttons and saves the new order", async () => {
    const user = userEvent.setup();
    mocked.saveOrder.mockResolvedValue();
    render(<GalleryManager initialImages={[photo("a"), photo("b"), photo("c")]} />);

    await user.click(screen.getByRole("button", { name: `${t.moveLater}: ${t.photo(1)}` }));

    expect(mocked.saveOrder).toHaveBeenCalledWith(["b", "a", "c"]);
    expect(cards()).toEqual(["https://cdn.test/b.webp", "https://cdn.test/a.webp", "https://cdn.test/c.webp"]);
    expect(await screen.findByText(t.orderSaved)).toBeInTheDocument();
  });

  it("puts the old order back when saving fails", async () => {
    const user = userEvent.setup();
    mocked.saveOrder.mockRejectedValue(new Error("offline"));
    render(<GalleryManager initialImages={[photo("a"), photo("b")]} />);

    await user.click(screen.getByRole("button", { name: `${t.moveEarlier}: ${t.photo(2)}` }));

    await waitFor(() => expect(cards()).toEqual(["https://cdn.test/a.webp", "https://cdn.test/b.webp"]));
    expect(await screen.findByText(t.saveFailed)).toBeInTheDocument();
  });

  it("cannot move the first photo earlier or the last one later", () => {
    render(<GalleryManager initialImages={[photo("a"), photo("b")]} />);

    expect(screen.getByRole("button", { name: `${t.moveEarlier}: ${t.photo(1)}` })).toBeDisabled();
    expect(screen.getByRole("button", { name: `${t.moveLater}: ${t.photo(2)}` })).toBeDisabled();
  });

  it("asks before deleting, and Cancel keeps the photo", async () => {
    const user = userEvent.setup();
    mocked.deleteImage.mockResolvedValue();
    render(<GalleryManager initialImages={[photo("a"), photo("b")]} />);

    const deleteButton = screen.getByRole("button", { name: `${t.delete}: ${t.photo(1)}` });
    await user.click(deleteButton);
    const dialog = screen.getByRole("alertdialog", { name: t.deleteTitle });
    expect(within(dialog).getByRole("button", { name: t.cancel })).toHaveFocus();

    await user.click(within(dialog).getByRole("button", { name: t.cancel }));
    expect(mocked.deleteImage).not.toHaveBeenCalled();
    expect(deleteButton).toHaveFocus();

    await user.click(deleteButton);
    await user.click(screen.getByRole("button", { name: t.deleteConfirm }));

    expect(mocked.deleteImage).toHaveBeenCalledWith("a");
    await waitFor(() => expect(cards()).toEqual(["https://cdn.test/b.webp"]));
    expect(await screen.findByText(t.deleted)).toBeInTheDocument();
  });

  it("saves captions when leaving the field", async () => {
    const user = userEvent.setup();
    mocked.updateCaptions.mockResolvedValue({ ...photo("a"), captionBg: "Фейд" });
    render(<GalleryManager initialImages={[photo("a")]} />);

    await user.type(screen.getByLabelText(t.captionBg), "Фейд");
    await user.tab();

    expect(mocked.updateCaptions).toHaveBeenCalledWith("a", "Фейд", "");
    expect(await screen.findByText(t.saved)).toBeInTheDocument();
  });

  it("refuses wrong file types without uploading them", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<GalleryManager initialImages={[]} />);

    await user.upload(screen.getByLabelText(new RegExp(t.dropzone)), new File(["x"], "photo.heic", { type: "image/heic" }));

    expect(await screen.findByText(t.uploadErrors.unsupported_type)).toBeInTheDocument();
    expect(mocked.uploadImage).not.toHaveBeenCalled();
  });

  it("uploads accepted files and adds them at the end", async () => {
    const user = userEvent.setup();
    mocked.uploadImage.mockImplementation(async (_file, onProgress) => {
      onProgress(0.5);
      return photo("new");
    });
    render(<GalleryManager initialImages={[photo("a")]} />);

    await user.upload(screen.getByLabelText(new RegExp(t.dropzone)), new File(["x"], "cut.jpg", { type: "image/jpeg" }));

    await waitFor(() => expect(cards()).toEqual(["https://cdn.test/a.webp", "https://cdn.test/new.webp"]));
    expect(screen.getByText(t.uploaded)).toBeInTheDocument();
  });
});
