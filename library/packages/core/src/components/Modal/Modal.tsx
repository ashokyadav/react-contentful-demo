import * as React from "react";
import { IconClose } from "@myproject/icons";
import { cx } from "../../utils/cx";
import s from "./Modal.module.scss";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** "drawer" slides in from the side. "fullscreen" covers the viewport, for a mobile menu. */
  placement?: "center" | "drawer" | "fullscreen";
  /** Close when the backdrop is clicked. Keep false for forms where data could be lost. */
  closeOnBackdrop?: boolean;
  className?: string;
}

/**
 * Built on native <dialog>.showModal(): the page behind becomes inert,
 * focus is contained, Esc closes, and focus returns to the trigger on close.
 */
export function Modal({ open, onClose, title, description, children, footer, size = "md", placement = "center", closeOnBackdrop = true, className }: ModalProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const returnFocus = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      returnFocus.current = document.activeElement as HTMLElement;
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  React.useEffect(() => () => { document.documentElement.style.overflow = ""; }, []);

  // Runs for every close path (Esc, button, backdrop, programmatic).
  const handleClose = () => {
    document.documentElement.style.overflow = "";
    returnFocus.current?.focus?.();
    if (open) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={cx(s.dialog, s[size], placement === "drawer" && s.drawer, placement === "fullscreen" && s.fullscreen, className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={handleClose}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (closeOnBackdrop && e.target === e.currentTarget) onClose(); }}
    >
      <div className={s.surface}>
        <div className={s.header}>
          <h2 id={titleId} className={s.title}>{title}</h2>
          <button type="button" className={s.close} onClick={onClose}>
            <IconClose /><span className="visually-hidden">Close</span>
          </button>
        </div>
        {description && <p id={descId} className={s.description}>{description}</p>}
        <div className={s.body}>{children}</div>
        {footer && <div className={s.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
