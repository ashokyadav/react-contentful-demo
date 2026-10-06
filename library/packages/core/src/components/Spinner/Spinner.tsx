import * as React from "react";
import { cx } from "../../utils/cx";
import type { Size } from "../../utils/types";
import s from "./Spinner.module.scss";
import { useLabel } from "../Labels/Labels";

export interface SpinnerProps {
  /** Announced to screen readers. */
  label?: string;
  size?: Size;
  className?: string;
}

export function Spinner({ label, size = "md", className }: SpinnerProps) {
  const loading = useLabel("loading", "Loading");
  return (
    <span role="status" className={cx(s.wrap, className)}>
      <span className={cx(s.spinner, s[size])} aria-hidden="true" />
      <span className="visually-hidden">{label || loading}</span>
    </span>
  );
}
