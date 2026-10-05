import * as React from "react";
import { FormField, fieldControlProps } from "../FormField/FormField";
import type { FieldBaseProps } from "../TextInput/TextInput";
import { cx } from "../../utils/cx";
import f from "../FormField/FormField.module.scss";
import s from "./Textarea.module.scss";

export interface TextareaProps extends FieldBaseProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Shows "n of max characters used"; announced politely only when within 20 of the limit. */
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, hideLabel, fieldClassName, required, disabled, id, className, showCount, maxLength, value, defaultValue, onChange, rows = 4, "aria-describedby": ariaDesc, ...rest },
  ref
) {
  const [length, setLength] = React.useState(String(value ?? defaultValue ?? "").length);
  React.useEffect(() => {
    if (value !== undefined) setLength(String(value).length);
  }, [value]);
  const countId = React.useId();
  const near = maxLength !== undefined && maxLength - length <= 20;

  return (
    <FormField label={label} hint={hint} error={error} required={required} disabled={disabled} hideLabel={hideLabel} id={id} className={fieldClassName}>
      {(ctx) => (
        <>
          <textarea
            ref={ref}
            rows={rows}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={(e) => {
              setLength(e.target.value.length);
              onChange?.(e);
            }}
            className={cx(f.control, s.textarea, className)}
            {...rest}
            {...fieldControlProps(ctx, {
              "aria-describedby": [ariaDesc, showCount && maxLength ? countId : undefined].filter(Boolean).join(" ") || undefined,
            })}
          />
          {showCount && maxLength !== undefined && (
            <p id={countId} className={cx(s.count, near && s.near)} aria-live={near ? "polite" : "off"}>
              {length} of {maxLength} characters used
            </p>
          )}
        </>
      )}
    </FormField>
  );
});
