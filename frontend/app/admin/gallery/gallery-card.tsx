import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, ArrowRight, GripVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { GalleryImage } from "~/gallery/gallery-api";

import { TextField } from "../form-controls";
import { ADMIN } from "../messages";

/** Typing pauses this long before captions save on their own. */
const AUTOSAVE_MS = 1200;
const MAX_CAPTION = 300;

type Props = {
  image: GalleryImage;
  position: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onSaveCaptions: (id: string, captionBg: string, captionEn: string) => Promise<void>;
  onDelete: (image: GalleryImage) => void;
};

/** One photo in the Gallery manager: thumbnail, drag handle, arrow buttons, captions, delete. */
export function GalleryCard({ image, position, total, onMove, onSaveCaptions, onDelete }: Props) {
  const t = ADMIN.gallery;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });
  const [captionBg, setCaptionBg] = useState(image.captionBg ?? "");
  const [captionEn, setCaptionEn] = useState(image.captionEn ?? "");
  const saved = useRef({ bg: image.captionBg ?? "", en: image.captionEn ?? "" });
  const number = position + 1;

  function save() {
    const bg = captionBg.trim();
    const en = captionEn.trim();
    if (bg === saved.current.bg && en === saved.current.en) return;
    saved.current = { bg, en };
    void onSaveCaptions(image.id, bg, en).catch(() => {
      // Let the next blur or pause try again.
      saved.current = { bg: "\u0000", en: "\u0000" };
    });
  }

  // Save after a pause in typing, as well as on leaving the field.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const timer = window.setTimeout(() => saveRef.current(), AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [captionBg, captionEn]);

  const iconButton =
    "inline-flex size-11 items-center justify-center rounded-input text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col rounded-input border bg-surface ${
        isDragging ? "relative z-10 border-fg shadow-[0_1px_2px_rgb(0_0_0/0.3)]" : "border-border"
      }`}
    >
      <div className="relative">
        <img
          src={image.thumbUrl}
          width={image.thumbWidth}
          height={image.thumbHeight}
          alt=""
          loading="lazy"
          className="aspect-[4/5] w-full rounded-t-input object-cover"
        />
        <span className="type-label absolute top-2 left-2 rounded-input bg-bg/80 px-2 py-1 text-fg">{number}</span>
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={t.dragHandle(number)}
          className="absolute top-1 right-1 inline-flex size-11 cursor-grab touch-none items-center justify-center rounded-input bg-bg/80 text-fg transition-colors duration-150 hover:bg-bg active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-3">
        <TextField
          label={t.captionBg}
          lang="bg"
          maxLength={MAX_CAPTION}
          value={captionBg}
          onChange={(event) => setCaptionBg(event.target.value)}
          onBlur={save}
        />
        <TextField
          label={t.captionEn}
          lang="en"
          maxLength={MAX_CAPTION}
          value={captionEn}
          onChange={(event) => setCaptionEn(event.target.value)}
          onBlur={save}
        />

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2">
          <div className="flex gap-1">
            <button
              type="button"
              aria-label={`${t.moveEarlier}: ${t.photo(number)}`}
              title={t.moveEarlier}
              disabled={position === 0}
              onClick={() => onMove(position, position - 1)}
              className={iconButton}
            >
              <ArrowLeft aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label={`${t.moveLater}: ${t.photo(number)}`}
              title={t.moveLater}
              disabled={position === total - 1}
              onClick={() => onMove(position, position + 1)}
              className={iconButton}
            >
              <ArrowRight aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </div>
          <button
            type="button"
            aria-label={`${t.delete}: ${t.photo(number)}`}
            onClick={() => onDelete(image)}
            className="inline-flex min-h-11 items-center gap-2 rounded-input px-3 text-small text-danger transition-colors duration-150 hover:bg-surface-2"
          >
            <Trash2 aria-hidden="true" size={18} strokeWidth={1.5} />
            {t.delete}
          </button>
        </div>
      </div>
    </li>
  );
}
