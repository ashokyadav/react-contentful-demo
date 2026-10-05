import * as React from "react";
import { IconClose } from "@myproject/icons";
import { toneIcon } from "../Alert/Alert";
import { cx } from "../../utils/cx";
import type { Tone } from "../../utils/types";
import s from "./Toast.module.scss";

export interface ToastOptions {
  message: React.ReactNode;
  tone?: Tone;
  /**
   * Auto-dismiss after ms. Defaults to 6000 (errors default to 0 = stay until dismissed,
   * so nobody misses them — WCAG 2.2.1). Timer pauses on hover/focus.
   */
  duration?: number;
  action?: { label: string; onClick: () => void };
}
interface ToastRecord extends ToastOptions { id: number; }

const ToastContext = React.createContext<{ show: (t: ToastOptions) => number; dismiss: (id: number) => void } | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children, label = "Notifications" }: { children: React.ReactNode; label?: string }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);
  const nextId = React.useRef(1);
  const dismiss = React.useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = React.useCallback((opts: ToastOptions) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, ...opts }]);
    return id;
  }, []);
  const api = React.useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* The region exists before any toast so screen readers reliably announce additions. */}
      <section aria-label={label} className={s.region}>
        <div aria-live="polite" aria-relevant="additions">
          <ol className={s.list}>
            {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />)}
          </ol>
        </div>
      </section>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: () => void }) {
  const tone = toast.tone ?? "info";
  const duration = toast.duration ?? (tone === "error" ? 0 : 6000);
  const [paused, setPaused] = React.useState(false);
  const remaining = React.useRef(duration);
  const started = React.useRef(Date.now());

  React.useEffect(() => {
    if (!duration || paused) return;
    started.current = Date.now();
    const t = window.setTimeout(onDismiss, remaining.current);
    return () => {
      window.clearTimeout(t);
      remaining.current -= Date.now() - started.current;
    };
  }, [duration, paused, onDismiss]);

  return (
    <li
      className={cx(s.toast, s[tone])}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className={s.icon} aria-hidden="true">{toneIcon[tone]}</span>
      <div className={s.message}>{toast.message}</div>
      {toast.action && (
        <button type="button" className={s.action} onClick={() => { toast.action!.onClick(); onDismiss(); }}>
          {toast.action.label}
        </button>
      )}
      <button type="button" className={s.close} onClick={onDismiss}>
        <IconClose size="sm" /><span className="visually-hidden">Dismiss notification</span>
      </button>
    </li>
  );
}
