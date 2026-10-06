import * as React from "react";
import { IconError } from "@myproject/icons";
import { cx } from "../../utils/cx";
import s from "./Form.module.scss";
import { useLabel } from "../Labels/Labels";

/* ---------------- Form ---------------- */

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Use library validation messages instead of the browser's native bubbles. Default true. */
  customValidation?: boolean;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(function Form(
  { customValidation = true, className, ...rest },
  ref
) {
  return <form ref={ref} noValidate={customValidation} className={cx(s.form, className)} {...rest} />;
});

/* ---------------- FormGroup ---------------- */

export interface FormGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Groups related fields (e.g. "Shipping address") under a fieldset/legend. */
  legend: React.ReactNode;
  hint?: React.ReactNode;
  hideLegend?: boolean;
  /** Lay fields side by side above 768px. */
  columns?: 1 | 2 | 3;
}

export function FormGroup({ legend, hint, hideLegend, columns = 1, className, children, ...rest }: FormGroupProps) {
  const hintId = React.useId();
  return (
    <fieldset className={cx(s.group, className)} aria-describedby={hint ? hintId : undefined} {...rest}>
      <legend className={hideLegend ? "visually-hidden" : s.legend}>{legend}</legend>
      {hint && <p id={hintId} className={s.hint}>{hint}</p>}
      <div className={s.fields} style={{ "--cols": columns } as React.CSSProperties}>{children}</div>
    </fieldset>
  );
}

/* ---------------- ErrorSummary ---------------- */

export interface ErrorSummaryProps {
  title?: string;
  /** Keyed by field id; each link moves focus to its field. */
  errors: Array<{ fieldId: string; message: string }>;
}

/** Shown at the top of a form after a failed submit. Receives focus so the problem list is read out. */
export const ErrorSummary = React.forwardRef<HTMLDivElement, ErrorSummaryProps>(function ErrorSummary(
  { title, errors },
  ref
) {
  const titleId = React.useId();
  const fixErrors = useLabel("fixErrors", "Fix the following to continue");
  if (errors.length === 0) return null;
  return (
    <div ref={ref} className={s.summary} tabIndex={-1} role="group" aria-labelledby={titleId}>
      <h2 id={titleId} className={s.summaryTitle}><IconError size="md" />{title || fixErrors}</h2>
      <ul>
        {errors.map((e) => (
          <li key={e.fieldId}>
            <a
              href={`#${e.fieldId}`}
              onClick={(ev) => {
                const el = document.getElementById(e.fieldId);
                if (!el) return;
                ev.preventDefault();
                el.focus();
                el.scrollIntoView({ block: "center" });
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
