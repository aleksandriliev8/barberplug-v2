import { api, ApiError, CSRF_HEADER, ensureCsrfToken } from "~/lib/api";

/** A Gallery Image as the API returns it (see GalleryController.GalleryImageResponse). */
export type GalleryImage = {
  id: string;
  captionBg: string | null;
  captionEn: string | null;
  thumbUrl: string;
  thumbWidth: number;
  thumbHeight: number;
  largeUrl: string;
  largeWidth: number;
  largeHeight: number;
};

/** The caption in the page's Locale, or null when the Owner left it empty. */
export function captionFor(image: GalleryImage, locale: "bg" | "en"): string | null {
  return (locale === "bg" ? image.captionBg : image.captionEn) || null;
}

/** Upload rules, kept in step with the backend (multipart limit and ImageProcessor). */
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export function listGallery(): Promise<GalleryImage[]> {
  return api<GalleryImage[]>("/api/gallery");
}

export function updateCaptions(id: string, captionBg: string, captionEn: string): Promise<GalleryImage> {
  return api<GalleryImage>(`/api/admin/gallery/${id}`, { method: "PATCH", body: { captionBg, captionEn } });
}

export function saveOrder(ids: string[]): Promise<void> {
  return api("/api/admin/gallery/order", { method: "PUT", body: { ids } });
}

export function deleteImage(id: string): Promise<void> {
  return api(`/api/admin/gallery/${id}`, { method: "DELETE" });
}

/**
 * Uploads one photo. Uses XMLHttpRequest instead of fetch because fetch cannot report upload
 * progress, and MASTER.md asks for a progress bar per file.
 */
export async function uploadImage(file: File, onProgress: (fraction: number) => void): Promise<GalleryImage> {
  const token = await ensureCsrfToken();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/gallery");
    xhr.withCredentials = true;
    xhr.setRequestHeader("Accept", "application/json");
    if (token) xhr.setRequestHeader(CSRF_HEADER, token);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      let payload: { error?: string } & Partial<GalleryImage> = {};
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // no JSON body
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload as GalleryImage);
      } else {
        reject(new ApiError(xhr.status, payload.error ?? `http_${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new ApiError(0, "network"));

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

/** Checks that need no server: catches the common mistakes before a 15 MB upload starts. */
export function checkFile(file: File): "unsupported_type" | "too_large" | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "unsupported_type";
  if (file.size > MAX_UPLOAD_BYTES) return "too_large";
  return null;
}
