import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRef, useState } from "react";

import {
  checkFile,
  deleteImage,
  saveOrder,
  updateCaptions,
  uploadImage,
  type GalleryImage,
} from "~/gallery/gallery-api";
import { ApiError } from "~/lib/api";

import { ConfirmDialog } from "../confirm-dialog";
import { ADMIN } from "../messages";
import { ToastRegion, useToast } from "../toast";
import { GalleryCard } from "./gallery-card";
import { UploadDropzone, type UploadItem } from "./upload-dropzone";

/** Finished upload rows disappear after this long. */
const DONE_ROW_MS = 4000;

/**
 * The Owner's Gallery manager (MASTER.md "Admin area"): upload, caption, reorder (drag or
 * arrow buttons), delete. Changes save straight away; the public Gallery reads the same data.
 */
export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const t = ADMIN.gallery;
  const [images, setImages] = useState(initialImages);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [pendingDelete, setPendingDelete] = useState<GalleryImage | null>(null);
  const { toast, show } = useToast();
  const queue = useRef(Promise.resolve());
  const nextKey = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function patchUpload(key: string, patch: Partial<UploadItem>) {
    setUploads((items) => items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  /** Files upload one after another, so a big batch does not swamp the connection. */
  function handleFiles(files: File[]) {
    for (const file of files) {
      nextKey.current += 1;
      const key = `upload-${nextKey.current}`;
      const problem = checkFile(file);
      setUploads((items) => [
        ...items,
        problem
          ? { key, name: file.name, progress: 0, status: "error", error: t.uploadErrors[problem] }
          : { key, name: file.name, progress: 0, status: "uploading" },
      ]);
      if (problem) continue;

      queue.current = queue.current.then(async () => {
        try {
          const image = await uploadImage(file, (progress) => patchUpload(key, { progress }));
          setImages((current) => [...current, image]);
          patchUpload(key, { status: "done", progress: 1 });
          window.setTimeout(() => setUploads((items) => items.filter((item) => item.key !== key)), DONE_ROW_MS);
        } catch (error) {
          const code = error instanceof ApiError ? error.code : "";
          patchUpload(key, { status: "error", error: t.uploadErrors[code] ?? t.uploadFailed });
        }
      });
    }
  }

  async function applyOrder(next: GalleryImage[]) {
    const previous = images;
    setImages(next);
    try {
      await saveOrder(next.map((image) => image.id));
      show(t.orderSaved);
    } catch {
      setImages(previous);
      show(t.saveFailed, "error");
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    void applyOrder(arrayMove(images, from, to));
  }

  /** Screen reader messages in "photo N" terms instead of dnd-kit's default internal ids. */
  const numberOf = (id: UniqueIdentifier) => images.findIndex((image) => image.id === id) + 1;
  const accessibility = {
    screenReaderInstructions: { draggable: t.dragInstructions },
    announcements: {
      onDragStart: ({ active }: { active: { id: UniqueIdentifier } }) => t.dragPickedUp(numberOf(active.id)),
      onDragOver: ({ active, over }: { active: { id: UniqueIdentifier }; over: { id: UniqueIdentifier } | null }) =>
        over ? t.dragOver(numberOf(active.id), numberOf(over.id)) : undefined,
      onDragEnd: ({ active, over }: { active: { id: UniqueIdentifier }; over: { id: UniqueIdentifier } | null }) =>
        over ? t.dragDropped(numberOf(active.id), numberOf(over.id)) : t.dragCancelled(numberOf(active.id)),
      onDragCancel: ({ active }: { active: { id: UniqueIdentifier } }) => t.dragCancelled(numberOf(active.id)),
    },
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = images.findIndex((image) => image.id === active.id);
    const to = images.findIndex((image) => image.id === over.id);
    move(from, to);
  }

  async function saveCaptions(id: string, captionBg: string, captionEn: string) {
    try {
      const updated = await updateCaptions(id, captionBg, captionEn);
      setImages((current) => current.map((image) => (image.id === id ? updated : image)));
      show(t.saved);
    } catch (error) {
      show(t.saveFailed, "error");
      throw error;
    }
  }

  async function confirmDelete() {
    const image = pendingDelete;
    setPendingDelete(null);
    if (!image) return;
    try {
      await deleteImage(image.id);
      setImages((current) => current.filter((item) => item.id !== image.id));
      show(t.deleted);
    } catch {
      show(t.saveFailed, "error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <UploadDropzone uploads={uploads} onFiles={handleFiles} />

      <section aria-labelledby="gallery-photos-heading">
        <h2 id="gallery-photos-heading" className="mb-4 text-small font-medium text-fg-muted">
          {t.count(images.length)}
        </h2>
        {images.length === 0 ? (
          <p className="text-fg-muted">{t.empty}</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            accessibility={accessibility}
          >
            <SortableContext items={images.map((image) => image.id)} strategy={rectSortingStrategy}>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4">
                {images.map((image, index) => (
                  <GalleryCard
                    key={image.id}
                    image={image}
                    position={index}
                    total={images.length}
                    onMove={move}
                    onSaveCaptions={saveCaptions}
                    onDelete={setPendingDelete}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {pendingDelete && (
        <ConfirmDialog
          title={t.deleteTitle}
          body={t.deleteBody}
          confirmLabel={t.deleteConfirm}
          cancelLabel={t.cancel}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      <ToastRegion toast={toast} />
    </div>
  );
}
