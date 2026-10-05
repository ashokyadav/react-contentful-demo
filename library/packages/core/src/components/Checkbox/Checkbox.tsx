import * as React from "react";
import { ErrorMessage } from "../FormField/FormField";
import { cx } from "../../utils/cx";
import s from "../Radio/Choice.module.scss";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Mixed state, e.g. a "Select all" box when only some rows are selected. */
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, indeterminate = false, id: idProp, className, "aria-describedby": ariaDesc, ...rest },
  forwardedRef
) {
  const auto = React.useId();
  const id = idProp ?? `cb-${auto}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const inner = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwardedRef, () => inner.current as HTMLInputElement);
  React.useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx(s.choice, className)}>
      <input
        ref={inner}
        id={id}
        type="checkbox"
        className={cx(s.input, s.checkbox)}
        aria-describedby={[hintId, errorId, ariaDesc].filter(Boolean).join(" ") || undefined}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      <div className={s.text}>
        <label htmlFor={id} className={s.label}>{label}</label>
        {hint && <p id={hintId} className={s.hint}>{hint}</p>}
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      </div>
    </div>
  );
});
