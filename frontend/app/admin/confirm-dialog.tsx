import { useId, useRef } from "react";

import { Modal } from "~/components/modal";

type Props = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Yes/no question for destructive actions. Focus starts on Cancel, the safe choice. */
export function ConfirmDialog({ title, body, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const bodyId = useId();

  return (
    <Modal
      label={title}
      describedBy={bodyId}
      role="alertdialog"
      onClose={onCancel}
      initialFocus={cancelRef}
      className="flex items-center justify-center bg-bg/80 px-4"
    >
      <div className="w-full max-w-sm rounded-input border border-border bg-surface p-6 shadow-[0_1px_2px_rgb(0_0_0/0.3)]">
        <h2 className="type-heading text-h3">{title}</h2>
        <p id={bodyId} className="mt-3 text-small text-fg-muted">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="type-label inline-flex min-h-11 items-center rounded-input border border-border px-5 text-fg transition-colors duration-150 hover:bg-surface-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="type-label inline-flex min-h-11 items-center rounded-input border border-danger bg-danger px-5 text-bg transition-colors duration-150 hover:bg-transparent hover:text-danger"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
