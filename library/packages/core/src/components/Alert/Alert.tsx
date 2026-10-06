import * as React from "react";
import { IconClose, IconError, IconInfo, IconSuccess, IconWarning } from "@myproject/icons";
import { cx } from "../../utils/cx";
import type { Tone } from "../../utils/types";
import s from "./Alert.module.scss";
import { useLabel } from "../Labels/Labels";

export const toneIcon: Record<Tone, React.ReactNode> = {
  info: <IconInfo />,
  success: <IconSuccess />,
  warning: <IconWarning />,
  error: <IconError />,
};
export const toneLabel: Record<Tone, string> = { info: "Information", success: "Success", warning: "Warning", error: "Error" };

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: Tone;
  title?: React.ReactNode;
  /**
   * "off" (default): static message present at page load.
   * "polite": role="status", for messages that appear after an action.
   * "assertive": role="alert", for urgent errors only.
   */
  live?: "off" | "polite" | "assertive";
  onDismiss?: () => void;
  action?: React.ReactNode;
}

export function Alert({ tone = "info", title, live = "off", onDismiss, action, className, children, ...rest }: AlertProps) {
  const role = live === "assertive" ? "alert" : live === "polite" ? "status" : undefined;
  const tones = {
    info: useLabel("information", "Information"),
    success: useLabel("success", "Success"),
    warning: useLabel("warning", "Warning"),
    error: useLabel("error", "Error"),
  };
  const dismiss = useLabel("dismissAlert", "Dismiss");
  return (
    <div role={role} className={cx(s.alert, s[tone], className)} {...rest}>
      <span className={s.icon} aria-hidden="true">{toneIcon[tone]}</span>
      <div className={s.body}>
        {title && (
          <p className={s.title}>
            <span className="visually-hidden">{tones[tone]}: </span>
            {title}
          </p>
        )}
        {!title && <span className="visually-hidden">{tones[tone]}: </span>}
        {children && <div className={s.content}>{children}</div>}
        {action && <div className={s.action}>{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" className={s.dismiss} onClick={onDismiss}>
          <IconClose size="sm" />
          <span className="visually-hidden">{dismiss}</span>
        </button>
      )}
    </div>
  );
}
