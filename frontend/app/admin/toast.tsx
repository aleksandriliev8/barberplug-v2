import { CircleAlert, CircleCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Toast = { id: number; tone: "success" | "error"; text: string };

const VISIBLE_MS = 3000;

/** Short confirmation like "Saved" (MASTER.md: autosave with a "Saved" toast). */
export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const nextId = useRef(0);

  const show = useCallback((text: string, tone: Toast["tone"] = "success") => {
    nextId.current += 1;
    setToast({ id: nextId.current, tone, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.tone === "error" ? VISIBLE_MS * 2 : VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return { toast, show };
}

/** Always rendered, so screen readers announce each new message in the live region. */
export function ToastRegion({ toast }: { toast: Toast | null }) {
  const Icon = toast?.tone === "error" ? CircleAlert : CircleCheck;
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed right-4 bottom-4 z-[80] sm:right-6 sm:bottom-6">
      {toast && (
        <p
          key={toast.id}
          className={`animate-reveal flex items-center gap-2 rounded-input border bg-surface px-4 py-3 text-small shadow-[0_1px_2px_rgb(0_0_0/0.3)] ${
            toast.tone === "error" ? "border-danger text-danger" : "border-success text-success"
          }`}
        >
          <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
          {toast.text}
        </p>
      )}
    </div>
  );
}
