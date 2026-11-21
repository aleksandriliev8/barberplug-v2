import { useCallback, useEffect, useState } from "react";

import { useLocale, useMessages } from "~/i18n/use-locale";

import { captionFor, listGallery, type GalleryImage } from "./gallery-api";
import { Lightbox } from "./lightbox";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; images: GalleryImage[] };

/** Number of grey tiles shown while photos load (keeps the layout from jumping). */
const PLACEHOLDER_TILES = 8;

const GRID = "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4";

/**
 * The public Gallery: fetched after the page loads (ADR-0004), so a new upload shows at once.
 * 1/2/3/4 columns, fixed 4:5 tiles (no layout shift), lazy WebP thumbnails, lightbox on click.
 */
export function GalleryGrid() {
  const locale = useLocale();
  const t = useMessages().gallery;
  const [state, setState] = useState<State>({ status: "loading" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const load = useCallback(() => {
    setState({ status: "loading" });
    listGallery()
      .then((images) => setState({ status: "ready", images }))
      .catch(() => setState({ status: "error" }));
  }, []);

  useEffect(load, [load]);

  if (state.status === "loading") {
    return (
      <div role="status" aria-label={t.loading} className={GRID}>
        {Array.from({ length: PLACEHOLDER_TILES }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse bg-surface-2 motion-reduce:animate-none" />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="flex flex-col items-start gap-6">
        <p className="text-fg-muted">{t.error}</p>
        <button
          type="button"
          onClick={load}
          className="type-label inline-flex min-h-12 items-center border border-fg px-8 transition-colors duration-200 hover:bg-fg hover:text-bg"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  const { images } = state;
  if (images.length === 0) {
    return <p className="text-fg-muted">{t.empty}</p>;
  }

  return (
    <>
      <ul className={GRID}>
        {images.map((image, index) => {
          const caption = captionFor(image, locale);
          return (
            <li
              key={image.id}
              className="animate-reveal"
              style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={caption ? undefined : t.openPhoto(index + 1)}
                className="group block w-full overflow-hidden bg-surface"
              >
                <img
                  src={image.thumbUrl}
                  width={image.thumbWidth}
                  height={image.thumbHeight}
                  alt={caption ?? ""}
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-400 ease-[var(--ease-enter)] group-hover:scale-[1.03]"
                />
              </button>
            </li>
          );
        })}
      </ul>
      {openIndex !== null && (
        <Lightbox images={images} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}
