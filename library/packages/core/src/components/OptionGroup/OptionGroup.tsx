import * as React from "react";
import { ErrorMessage } from "../FormField/FormField";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import { useLabel } from "../Labels/Labels";
import s from "./OptionGroup.module.scss";

export interface OptionItem {
  value: string;
  label: string;
  /** CSS color. When set, the option renders as a color swatch instead of a text chip. */
  swatch?: string;
  disabled?: boolean;
}

export interface OptionGroupProps {
  /** Question this group answers, e.g. "Color" or "Chest". */
  legend: string;
  name?: string;
  options: OptionItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shown after the legend until something is selected, e.g. "Select chest". */
  placeholder?: string;
  /** Appends the selected label to the legend: "Color: Brown". */
  showValue?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
}

/**
 * Single-select chips for a product option: text (a chest size) or a color swatch.
 * Native radios, so arrow keys move between options.
 */
export function OptionGroup({
  legend, name, options, value, defaultValue = "", onChange, placeholder, showValue = true,
  hint, error, required, className,
}: OptionGroupProps) {
  const auto = React.useId();
  const groupName = name ?? `option-${auto}`;
  const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
  const selected = options.find((o) => o.value === current);
  const requiredLabel = useLabel("required", " (required)");
  const hintId = hint ? `${groupName}-hint` : undefined;
  const errorId = error ? `${groupName}-error` : undefined;
  return (
    <fieldset
      className={cx(s.group, className)}
      aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
    >
      <legend className={s.legend}>
        {legend}
        {showValue && (selected || placeholder) && (
          <span className={s.chosen}>{selected ? selected.label : placeholder}</span>
        )}
        {required && <span className={s.required}><span aria-hidden="true"> *</span><span className="visually-hidden">{requiredLabel}</span></span>}
      </legend>
      {hint && <p id={hintId} className={s.hint}>{hint}</p>}
      <div className={s.options} role="presentation">
        {options.map((o) => (
          <label key={o.value} className={cx(s.chip, o.swatch && s.swatchChip, o.disabled && s.disabled)}>
            <input
              type="radio"
              name={groupName}
              value={o.value}
              checked={current === o.value}
              disabled={o.disabled}
              required={required}
              onChange={() => setCurrent(o.value)}
            />
            {o.swatch ? (
              <>
                <span className={s.swatch} style={{ background: o.swatch }} aria-hidden="true" />
                <span className="visually-hidden">{o.label}</span>
              </>
            ) : (
              <span>{o.label}</span>
            )}
          </label>
        ))}
      </div>
      <ErrorMessage id={errorId}>{error}</ErrorMessage>
    </fieldset>
  );
}
