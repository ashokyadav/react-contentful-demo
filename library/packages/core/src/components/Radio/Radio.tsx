import * as React from "react";
import { ErrorMessage } from "../FormField/FormField";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import s from "./Choice.module.scss";

interface RadioGroupContextValue {
  name: string;
  value: string;
  setValue: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
  invalid: boolean;
}
const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  legend: React.ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: React.ReactNode;
}

/** A fieldset/legend group of native radios — arrow-key navigation comes free from the browser. */
export function RadioGroup({
  legend, name, value, defaultValue = "", onChange, hint, error, required, disabled,
  orientation = "vertical", className, children,
}: RadioGroupProps) {
  const auto = React.useId();
  const groupName = name ?? `radio-${auto}`;
  const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
  const hintId = hint ? `${groupName}-hint` : undefined;
  const errorId = error ? `${groupName}-error` : undefined;
  return (
    <RadioGroupContext.Provider value={{ name: groupName, value: current, setValue: setCurrent, disabled, required, invalid: Boolean(error) }}>
      <fieldset
        className={cx(s.fieldset, className)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        disabled={disabled}
      >
        <legend className={s.legend}>
          {legend}
          {required && <span className={s.required}><span aria-hidden="true"> *</span><span className="visually-hidden"> (required)</span></span>}
        </legend>
        {hint && <p id={hintId} className={s.hint}>{hint}</p>}
        <div className={cx(s.options, orientation === "horizontal" && s.horizontal)}>{children}</div>
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
  value: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, hint, id: idProp, className, disabled, ...rest },
  ref
) {
  const group = React.useContext(RadioGroupContext);
  const auto = React.useId();
  const id = idProp ?? `r-${auto}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const groupProps = group
    ? {
        name: group.name,
        checked: group.value === value,
        onChange: () => group.setValue(value),
        required: group.required || undefined,
        "aria-invalid": group.invalid || undefined,
      }
    : {};
  return (
    <div className={cx(s.choice, className)}>
      <input
        ref={ref}
        id={id}
        type="radio"
        value={value}
        className={cx(s.input, s.radio)}
        disabled={disabled ?? group?.disabled}
        aria-describedby={hintId}
        {...groupProps}
        {...rest}
      />
      <div className={s.text}>
        <label htmlFor={id} className={s.label}>{label}</label>
        {hint && <p id={hintId} className={s.hint}>{hint}</p>}
      </div>
    </div>
  );
});
