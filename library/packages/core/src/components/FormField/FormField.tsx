import * as React from "react";
import { IconError } from "@myproject/icons";
import { cx } from "../../utils/cx";
import s from "./FormField.module.scss";

/* ---------------- Context ---------------- */

interface FieldContextValue {
  id: string;
  hintId?: string;
  errorId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  describedBy?: string;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** Read the enclosing FormField's ids/state — use it to wire custom controls. */
export function useFormField() {
  return React.useContext(FieldContext);
}

/* ---------------- Label ---------------- */

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  /** Visually hide but keep available to assistive tech. */
  hidden?: boolean;
}

export function Label({ required, hidden, className, children, ...rest }: LabelProps) {
  return (
    <label className={cx(s.label, hidden && "visually-hidden", className)} {...rest}>
      {children}
      {required && (
        <span className={s.required}>
          <span aria-hidden="true"> *</span>
          <span className="visually-hidden"> (required)</span>
        </span>
      )}
    </label>
  );
}

/* ---------------- ErrorMessage ---------------- */

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
}

/**
 * Inline error. Not a live region by itself — errors are announced via the
 * control's aria-describedby when focus returns to it, or by an ErrorSummary on submit.
 */
export function ErrorMessage({ className, children, ...rest }: ErrorMessageProps) {
  if (!children) return null;
  return (
    <p className={cx(s.error, className)} {...rest}>
      <IconError size="sm" />
      <span>
        <span className="visually-hidden">Error: </span>
        {children}
      </span>
    </p>
  );
}

/* ---------------- FormField ---------------- */

export interface FormFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
  /** Override the generated id for the control. */
  id?: string;
  className?: string;
  children: React.ReactNode | ((ctx: FieldContextValue) => React.ReactNode);
}

/**
 * Wraps any control with label, hint and error, and wires
 * `id`, `aria-describedby`, `aria-invalid` and `aria-required` through context.
 */
export function FormField({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  hideLabel,
  id: idProp,
  className,
  children,
}: FormFieldProps) {
  const autoId = React.useId();
  const id = idProp ?? `field-${autoId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ctx: FieldContextValue = {
    id,
    hintId,
    errorId,
    invalid: Boolean(error),
    required,
    disabled,
    describedBy: [hintId, errorId].filter(Boolean).join(" ") || undefined,
  };
  return (
    <FieldContext.Provider value={ctx}>
      <div className={cx(s.field, disabled && s.disabled, className)}>
        <Label htmlFor={id} required={required} hidden={hideLabel}>
          {label}
        </Label>
        {hint && <p id={hintId} className={s.hint}>{hint}</p>}
        {typeof children === "function" ? children(ctx) : children}
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      </div>
    </FieldContext.Provider>
  );
}

/** Spread onto a native control inside a FormField. */
export function fieldControlProps(ctx: FieldContextValue | null, own: { id?: string; "aria-describedby"?: string } = {}) {
  if (!ctx) return {};
  return {
    id: own.id ?? ctx.id,
    "aria-describedby": [ctx.describedBy, own["aria-describedby"]].filter(Boolean).join(" ") || undefined,
    "aria-invalid": ctx.invalid || undefined,
    required: ctx.required || undefined,
    disabled: ctx.disabled || undefined,
  };
}
