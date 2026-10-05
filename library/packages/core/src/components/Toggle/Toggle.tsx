import * as React from "react";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import s from "./Toggle.module.scss";

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Put the label after the switch instead of before it. */
  labelPosition?: "start" | "end";
}

/**
 * Switch for settings that take effect immediately (no submit).
 * role="switch" + aria-checked; the state is conveyed by the switch itself, not by changing the label.
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { label, hint, checked, defaultChecked = false, onChange, labelPosition = "start", className, disabled, id: idProp, ...rest },
  ref
) {
  const [on, setOn] = useControllableState(checked, defaultChecked, onChange);
  const auto = React.useId();
  const id = idProp ?? `switch-${auto}`;
  const labelId = `${id}-label`;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={cx(s.toggle, labelPosition === "end" && s.end, disabled && s.disabled, className)}>
      <span className={s.text}>
        <span id={labelId} className={s.label} onClick={() => !disabled && setOn(!on)}>{label}</span>
        {hint && <span id={hintId} className={s.hint}>{hint}</span>}
      </span>
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={labelId}
        aria-describedby={hintId}
        disabled={disabled}
        className={s.track}
        onClick={() => setOn(!on)}
        {...rest}
      >
        <span className={s.thumb} aria-hidden="true" />
      </button>
    </div>
  );
});
