import * as React from "react";
import { cx } from "../../utils/cx";
import s from "./Skeleton.module.scss";

export interface SkeletonProps {
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
  /** Number of text lines (last one shorter). */
  lines?: number;
  className?: string;
}

/**
 * Purely visual placeholder — hidden from assistive tech.
 * Announce loading on the container instead: wrap with aria-busy="true" and include a <Spinner> or status text.
 */
export function Skeleton({ variant = "text", width, height, lines = 1, className }: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <span className={s.stack} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={cx(s.skeleton, s.text, className)} style={{ width: i === lines - 1 ? "60%" : width }} />
        ))}
      </span>
    );
  }
  return <span aria-hidden="true" className={cx(s.skeleton, s[variant], className)} style={{ width, height }} />;
}
