import * as React from "react";
import { cx } from "../../utils/cx";
import type { Size } from "../../utils/types";
import s from "./Spinner.module.scss";

export interface SpinnerProps {
  /** Announced to screen readers. */
  label?: string;
  size?: Size;
  className?: string;
}

export function Spinner({ label = "Loading", size = "md", className }: SpinnerProps) {
  return (
    <span role="status" className={cx(s.wrap, className)}>
      <span className={cx(s.spinner, s[size])} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
