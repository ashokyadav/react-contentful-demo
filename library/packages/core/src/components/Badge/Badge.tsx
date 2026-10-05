import * as React from "react";
import { cx } from "../../utils/cx";
import s from "./Badge.module.scss";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "info" | "success" | "warning" | "error" | "sale";
  /** Small count bubble for icons (e.g. bag count). Pair with a visible or visually hidden label on the parent. */
  count?: number;
  max?: number;
}

export function Badge({ tone = "neutral", count, max = 99, className, children, ...rest }: BadgeProps) {
  if (count !== undefined) {
    return (
      <span className={cx(s.count, className)} aria-hidden="true" {...rest}>
        {count > max ? `${max}+` : count}
      </span>
    );
  }
  return <span className={cx(s.badge, s[tone], className)} {...rest}>{children}</span>;
}
