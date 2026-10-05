import * as React from "react";
import { cx } from "../../utils/cx";
import s from "./Tooltip.module.scss";

export interface TooltipProps {
  content: React.ReactNode;
  /** A single focusable element (button, link). The tooltip describes it via aria-describedby. */
  children: React.ReactElement;
  placement?: "top" | "bottom";
  delay?: number;
  className?: string;
}

/**
 * Supplementary text on hover and focus. Meets WCAG 1.4.13:
 * dismissible (Esc), hoverable (pointer can move onto it), persistent (stays until dismissed/blurred).
 * Never put essential info or interactive content in a tooltip.
 */
export function Tooltip({ content, children, placement = "top", delay = 150, className }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const timer = React.useRef<number>();

  const show = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(true), delay); };
  const hide = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 100); };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const child = React.Children.only(children);
  const existing = (child.props as { "aria-describedby"?: string })["aria-describedby"];
  const trigger = React.cloneElement(child, {
    "aria-describedby": [existing, id].filter(Boolean).join(" "),
    onFocus: (e: React.FocusEvent) => { (child.props as any).onFocus?.(e); show(); },
    onBlur: (e: React.FocusEvent) => { (child.props as any).onBlur?.(e); hide(); },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <span className={cx(s.anchor, className)} onMouseEnter={show} onMouseLeave={hide}>
      {trigger}
      {/* Always rendered so aria-describedby resolves; hidden visually when closed. */}
      <span id={id} role="tooltip" className={cx(s.tooltip, s[placement], open && s.open)}>
        {content}
      </span>
    </span>
  );
}
