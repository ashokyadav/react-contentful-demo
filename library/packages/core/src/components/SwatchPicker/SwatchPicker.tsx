import s from "./SwatchPicker.module.scss";

export interface SwatchOption {
  label: string;
  /** CSS color, stored on the product in Contentstack. */
  value: string;
}

export interface SwatchPickerProps {
  /** Names the group, for example "Color". */
  label?: string;
  options: SwatchOption[];
  value?: string;
  onChange?: (value: string) => void;
}

/** A single-select row of color chips. The pressed chip is the selected color. */
export function SwatchPicker({ label = "Color", options, value, onChange }: SwatchPickerProps) {
  return (
    <div className={s.group} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={s.swatch}
          style={{ background: option.value }}
          aria-pressed={option.value === value}
          aria-label={option.label}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onChange?.(option.value);
          }}
        />
      ))}
    </div>
  );
}
