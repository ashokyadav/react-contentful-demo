import * as React from "react";
import { cx } from "../../utils/cx";
import { useLabel } from "../Labels/Labels";
import type { Size } from "../../utils/types";
import s from "./Button.module.scss";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: Size;
  /** Shows a spinner, announces busy state, and blocks clicks while keeping focus in place. */
  loading?: boolean;
  /** Text read by screen readers while loading. */
  loadingLabel?: string;
  fullWidth?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    loadingLabel,
    fullWidth,
    iconStart,
    iconEnd,
    className,
    children,
    type = "button",
    disabled,
    onClick,
    ...rest
  },
  ref
) {
  const loadingText = useLabel("loading", "Loading");
  const announced = loadingLabel || loadingText;
  return (
    <button
      ref={ref}
      type={type}
      className={cx(s.button, s[variant], s[size], fullWidth && s.fullWidth, loading && s.loading, className)}
      disabled={disabled}
      // aria-disabled (not disabled) while loading so focus isn't lost mid-action
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (loading) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {loading && <span className={s.spinner} aria-hidden="true" />}
      {iconStart && <span className={s.icon} aria-hidden="true">{iconStart}</span>}
      <span className={s.label}>{children}</span>
      {iconEnd && <span className={s.icon} aria-hidden="true">{iconEnd}</span>}
      {loading && <span className="visually-hidden">, {announced}</span>}
    </button>
  );
});
