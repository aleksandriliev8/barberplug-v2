import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, type PointerEvent } from "react";

import { Modal } from "~/components/modal";
import { useLocale, useMessages } from "~/i18n/use-locale";

import { captionFor, type GalleryImage } from "./gallery-api";

type Props = {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

/** Minimum horizontal finger travel, in px, that counts as a swipe. */
const SWIPE_PX = 50;

/**
 * Full-screen photo viewer (MASTER.md): black backdrop, arrows, swipe, Esc and arrow keys,
 * caption under the photo, focus kept inside and returned on close. Loads the large WebP.
 */
export function Lightbox({ images, index, onIndexChange, onClose }: Props) {
  const locale = useLocale();
  const t = useMessages().gallery;
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipeStartX = useRef<number | null>(null);
  const image = images[index];
  const caption = captionFor(image, locale);
  const hasMany = images.length > 1;

  const previous = () => onIndexChange((index - 1 + images.length) % images.length);
  const next = () => onIndexChange((index + 1) % images.length);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!hasMany) return;
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  // Warm the cache for the neighbours so arrows feel instant.
  useEffect(() => {
    if (!hasMany) return;
    for (const neighbour of [images[(index + 1) % images.length], images[(index - 1 + images.length) % images.length]]) {
      const preload = new Image();
      preload.src = neighbour.largeUrl;
    }
  }, [images, index, hasMany]);

  function onPointerDown(event: PointerEvent) {
    swipeStartX.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent) {
    if (swipeStartX.current === null || !hasMany) return;
    const travel = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (travel > SWIPE_PX) previous();
    if (travel < -SWIPE_PX) next();
  }

  const iconButton =
    "inline-flex size-12 items-center justify-center text-fg transition-colors duration-150 hover:bg-surface-2";

  return (
    <Modal label={t.viewer} onClose={onClose} initialFocus={closeRef} className="flex flex-col bg-bg">
      <div className="flex h-16 shrink-0 items-center justify-between px-2 sm:px-4">
        <p className="type-label px-2 text-fg-muted" aria-live="polite">
          {t.counter(index + 1, images.length)}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className={iconButton}>
          <X aria-hidden="true" size={24} strokeWidth={1.5} />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-2 md:px-16"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <figure className="flex h-full max-h-full w-full flex-col items-center justify-center">
          <img
            key={image.id}
            src={image.largeUrl}
            width={image.largeWidth}
            height={image.largeHeight}
            alt={caption ?? t.altFallback}
            draggable={false}
            className="h-auto max-h-[calc(100svh-10rem)] w-auto max-w-full object-contain select-none"
          />
          {caption && <figcaption className="mt-4 max-w-[65ch] text-center text-small text-fg-muted">{caption}</figcaption>}
        </figure>

        {hasMany && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label={t.previous}
              className={`${iconButton} absolute top-1/2 left-1 bg-bg/60 md:bg-transparent -translate-y-1/2 md:left-4`}
            >
              <ChevronLeft aria-hidden="true" size={28} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t.next}
              className={`${iconButton} absolute top-1/2 right-1 bg-bg/60 md:bg-transparent -translate-y-1/2 md:right-4`}
            >
              <ChevronRight aria-hidden="true" size={28} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
