import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  children: ReactNode;
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  /** Id of the element that describes the dialog. */
  describedBy?: string;
  /** `alertdialog` for questions that need an answer, like "Delete this photo?". */
  role?: "dialog" | "alertdialog";
  /** Element to focus first; defaults to the first focusable element inside. */
  initialFocus?: RefObject<HTMLElement | null>;
  className?: string;
};

/**
 * Modal dialog: rendered on top of the page, keeps Tab inside, closes on Escape, locks page
 * scroll, and gives focus back to whatever had it before (MASTER.md: "focus trapped and
 * returned"). Written by hand because the native <dialog> is not available in the test DOM.
 */
export function Modal({ children, onClose, label, describedBy, role = "dialog", initialFocus, className = "" }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    (initialFocus?.current ?? panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Hide the page behind the dialog from keyboard, pointer and screen readers.
    const portalHost = panel?.parentElement === document.body ? panel : null;
    const background = [...document.body.children].filter(
      (element) => element !== portalHost && !element.hasAttribute("inert"),
    );
    background.forEach((element) => {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      background.forEach((element) => {
        element.removeAttribute("inert");
        element.removeAttribute("aria-hidden");
      });
      previouslyFocused?.focus?.();
    };
    // Runs once per opening; initialFocus is read on open only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      ref={panelRef}
      role={role}
      aria-modal="true"
      aria-label={label}
      aria-describedby={describedBy}
      tabIndex={-1}
      className={`fixed inset-0 z-[70] outline-none ${className}`}
    >
      {children}
    </div>,
    document.body,
  );
}
