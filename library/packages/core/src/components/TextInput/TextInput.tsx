import * as React from "react";
import { FormField, fieldControlProps } from "../FormField/FormField";
import { cx } from "../../utils/cx";
import f from "../FormField/FormField.module.scss";

export interface FieldBaseProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  hideLabel?: boolean;
  /** Class for the outer field wrapper. */
  fieldClassName?: string;
}

export interface TextInputProps
  extends FieldBaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, hint, error, hideLabel, fieldClassName, required, disabled, id, className, "aria-describedby": ariaDesc, type = "text", ...rest },
  ref
) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} disabled={disabled} hideLabel={hideLabel} id={id} className={fieldClassName}>
      {(ctx) => (
        <input
          ref={ref}
          type={type}
          className={cx(f.control, className)}
          {...rest}
          {...fieldControlProps(ctx, { "aria-describedby": ariaDesc })}
        />
      )}
    </FormField>
  );
});
