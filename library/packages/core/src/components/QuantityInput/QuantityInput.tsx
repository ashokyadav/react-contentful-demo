import * as React from "react";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import { useLabel } from "../Labels/Labels";
import s from "./QuantityInput.module.scss";

export interface QuantityInputProps {
  /** Names the control. Defaults to "Quantity". */
  label?: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
}

function clamp(n: number, min: number, max?: number) {
  const lower = Math.max(min, n);
  return max === undefined ? lower : Math.min(max, lower);
}

/**
 * Minus, a number, and plus — the quantity control on a product page.
 * The number can also be typed. Decrease and increase announce the new quantity.
 */
export function QuantityInput({
  label,
  value,
  defaultValue = 1,
  onChange,
  min = 1,
  max,
  disabled,
  id: idProp,
  className,
}: QuantityInputProps) {
  const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
  const [text, setText] = React.useState(String(current));
  const [announcement, setAnnouncement] = React.useState("");
  const autoId = React.useId();
  const id = idProp ?? `qty-${autoId}`;
  const quantity = useLabel("quantity", "Quantity");
  const name = label || quantity;
  const decrease = useLabel("decrease", "Decrease {label}", { label: name.toLowerCase() });
  const increase = useLabel("increase", "Increase {label}", { label: name.toLowerCase() });

  React.useEffect(() => {
    setText(String(current));
  }, [current]);

  const commit = (next: number, announce: boolean) => {
    const clamped = clamp(next, min, max);
    setCurrent(clamped);
    setText(String(clamped));
    if (announce) setAnnouncement(`${name} ${clamped}`);
  };

  return (
    <div className={cx(s.field, className)}>
      <label htmlFor={id} className={s.label}>{name}</label>
      <div className={s.control}>
        <button
          type="button"
          className={s.step}
          onClick={() => commit(current - 1, true)}
          disabled={disabled || current <= min}
        >
          <span aria-hidden="true">−</span>
          <span className="visually-hidden">{decrease}</span>
        </button>
        <input
          id={id}
          className={s.input}
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw !== "" && !/^\d+$/.test(raw)) return;
            setText(raw);
            if (raw === "") return;
            const n = clamp(Number(raw), min, max);
            setCurrent(n);
            if (String(n) !== raw) setText(String(n));
          }}
          onBlur={() => {
            if (text === "" || Number(text) < min) commit(min, false);
          }}
        />
        <button
          type="button"
          className={s.step}
          onClick={() => commit(current + 1, true)}
          disabled={disabled || (max !== undefined && current >= max)}
        >
          <span aria-hidden="true">+</span>
          <span className="visually-hidden">{increase}</span>
        </button>
      </div>
      <span className="visually-hidden" aria-live="polite">{announcement}</span>
    </div>
  );
}
