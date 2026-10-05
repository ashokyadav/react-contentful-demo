import * as React from "react";
import { cx } from "../../utils/cx";
import s from "./ProgressBar.module.scss";

export interface ProgressBarProps {
  label: string;
  /** Omit for indeterminate progress. */
  value?: number;
  max?: number;
  /** Human-readable value, e.g. "$45 of $75 for free shipping". */
  valueText?: string;
  showValue?: boolean;
  tone?: "default" | "success";
  className?: string;
}

export function ProgressBar({ label, value, max = 100, valueText, showValue = true, tone = "default", className }: ProgressBarProps) {
  const id = React.useId();
  const indeterminate = value === undefined;
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cx(s.progress, className)}>
      <div className={s.header}>
        <span id={id} className={s.label}>{label}</span>
        {showValue && !indeterminate && <span className={s.value} aria-hidden="true">{valueText ?? `${Math.round(pct)}%`}</span>}
      </div>
      <div
        role="progressbar"
        aria-labelledby={id}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuetext={valueText}
        className={cx(s.track, indeterminate && s.indeterminate, tone === "success" && s.success)}
      >
        <div className={s.fill} style={indeterminate ? undefined : { width: `${pct}%` }} />
      </div>
    </div>
  );
}
