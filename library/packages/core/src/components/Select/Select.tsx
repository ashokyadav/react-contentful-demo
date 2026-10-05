import * as React from "react";
import { IconChevronDown } from "@myproject/icons";
import { FormField, fieldControlProps } from "../FormField/FormField";
import type { FieldBaseProps } from "../TextInput/TextInput";
import { cx } from "../../utils/cx";
import f from "../FormField/FormField.module.scss";
import s from "./Select.module.scss";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends FieldBaseProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: Array<SelectOption | { group: string; options: SelectOption[] }>;
  /** Adds a first, empty option like "Select a size". */
  placeholder?: string;
}

/** Native <select>: the most robust dropdown across screen readers, mobile and voice control. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, hideLabel, fieldClassName, required, disabled, id, className, options, placeholder, "aria-describedby": ariaDesc, ...rest },
  ref
) {
  const renderOption = (o: SelectOption) => (
    <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
  );
  return (
    <FormField label={label} hint={hint} error={error} required={required} disabled={disabled} hideLabel={hideLabel} id={id} className={fieldClassName}>
      {(ctx) => (
        <div className={s.wrap}>
          <select ref={ref} className={cx(f.control, s.select, className)} {...rest} {...fieldControlProps(ctx, { "aria-describedby": ariaDesc })}>
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((o) =>
              "group" in o ? (
                <optgroup key={o.group} label={o.group}>{o.options.map(renderOption)}</optgroup>
              ) : (
                renderOption(o)
              )
            )}
          </select>
          <IconChevronDown className={s.chevron} size="sm" />
        </div>
      )}
    </FormField>
  );
});
