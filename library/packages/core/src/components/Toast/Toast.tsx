import * as React from "react";
import { createPortal } from "react-dom";
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
  /** Render this toast in a matching `ToastAnchor` instead of the viewport corner. */
  slot?: string;
}
interface ToastRecord extends ToastOptions { id: number; }

const ToastContext = React.createContext<{ show: (t: ToastOptions) => number; dismiss: (id: number) => void; toasts: ToastRecord[] } | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children, label = "Notifications" }: { children: React.ReactNode; label?: string }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const regionRef = React.useRef<HTMLElement>(null);
  const nextId = React.useRef(1);
  const dismiss = React.useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = React.useCallback((opts: ToastOptions) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, ...opts }]);
    return id;
  }, []);
  const api = React.useMemo(() => ({ show, dismiss, toasts }), [show, dismiss, toasts]);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const fit = () => {
      region.style.bottom = "";
      region.style.maxHeight = "";
      const viewport = window.visualViewport;
      const viewTop = viewport?.offsetTop ?? 0;
      const viewHeight = viewport?.height ?? window.innerHeight;
      const margin = 16;
      const limit = viewTop + viewHeight - margin;
      let rect = region.getBoundingClientRect();
      if (rect.bottom > limit) {
        const current = Number.parseFloat(window.getComputedStyle(region).bottom) || 0;
        region.style.bottom = `${current + rect.bottom - limit}px`;
        rect = region.getBoundingClientRect();
      }
      if (rect.top < viewTop + margin) region.style.maxHeight = `${Math.max(0, viewHeight - margin * 2)}px`;
    };
    fit();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", fit);
    viewport?.addEventListener("scroll", fit);
    window.addEventListener("resize", fit);
    return () => {
      viewport?.removeEventListener("resize", fit);
      viewport?.removeEventListener("scroll", fit);
      window.removeEventListener("resize", fit);
    };
  }, [toasts, mounted]);

  const region = (
    <section ref={regionRef} aria-label={label} className={s.region}>
      <div aria-live="polite" aria-relevant="additions">
        <ol className={s.list}>
          {toasts.filter((toast) => !toast.slot).map((t) => <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />)}
        </ol>
      </div>
    </section>
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Portal to the document so a transformed parent cannot park the toast off screen. */}
      {mounted ? createPortal(region, document.body) : region}
    </ToastContext.Provider>
  );
}

export function ToastAnchor({ id }: { id: string }) {
  const ctx = React.useContext(ToastContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const mine = ctx?.toasts.filter((toast) => toast.slot === id) ?? [];

  React.useEffect(() => {
    if (mine.length) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [mine.length]);

  if (!ctx || !mine.length) return null;
  return (
    <div ref={ref} className={s.anchor}>
      <ol className={s.list}>
        {mine.map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={() => ctx.dismiss(toast.id)} />)}
      </ol>
    </div>
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
