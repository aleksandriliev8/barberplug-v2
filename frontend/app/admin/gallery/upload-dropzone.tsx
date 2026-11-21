import { CircleAlert, CircleCheck, Upload } from "lucide-react";
import { useId, useState, type DragEvent } from "react";

import { ACCEPTED_TYPES } from "~/gallery/gallery-api";

import { ADMIN } from "../messages";

export type UploadItem = {
  key: string;
  name: string;
  /** 0..1 */
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

type Props = {
  uploads: UploadItem[];
  onFiles: (files: File[]) => void;
};

/** Drop area plus file picker; below it, one progress row per file (MASTER.md). */
export function UploadDropzone({ uploads, onFiles }: Props) {
  const t = ADMIN.gallery;
  const inputId = useId();
  const hintId = useId();
  const [dragging, setDragging] = useState(false);

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    const files = [...event.dataTransfer.files];
    if (files.length > 0) onFiles(files);
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-input border border-dashed px-6 py-10 text-center transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring hover:border-fg-muted hover:bg-surface ${
          dragging ? "border-fg bg-surface-2" : "border-border"
        }`}
      >
        <Upload aria-hidden="true" size={24} strokeWidth={1.5} className="text-fg-muted" />
        <span className="font-medium text-fg">{t.dropzone}</span>
        <span id={hintId} className="max-w-[48ch] text-small text-fg-muted">
          {t.dropzoneHint}
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          aria-describedby={hintId}
          className="sr-only"
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            event.target.value = ""; // allow choosing the same file again
            if (files.length > 0) onFiles(files);
          }}
        />
      </label>

      {uploads.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2" aria-label={t.uploading}>
          {uploads.map((item) => (
            <li key={item.key} className="rounded-input border border-border bg-surface px-4 py-3 text-small">
              <div className="flex items-center justify-between gap-4">
                <span className="truncate">{item.name}</span>
                <span className={`flex shrink-0 items-center gap-1 ${item.status === "error" ? "text-danger" : "text-fg-muted"}`}>
                  {item.status === "done" && <CircleCheck aria-hidden="true" size={16} strokeWidth={1.5} className="text-success" />}
                  {item.status === "error" && <CircleAlert aria-hidden="true" size={16} strokeWidth={1.5} />}
                  {item.status === "uploading" && `${Math.round(item.progress * 100)}%`}
                  {item.status === "done" && t.uploaded}
                  {item.status === "error" && item.error}
                </span>
              </div>
              {item.status === "uploading" && (
                <div
                  role="progressbar"
                  aria-label={item.name}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(item.progress * 100)}
                  className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2"
                >
                  <div className="h-full origin-left bg-fg transition-transform duration-150" style={{ transform: `scaleX(${item.progress})` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
