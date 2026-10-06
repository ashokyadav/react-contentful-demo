import * as React from "react";
import { IconCheck } from "@myproject/icons";
import { cx } from "../../utils/cx";
import { useLabel } from "../Labels/Labels";
import s from "./Stepper.module.scss";

export interface Step {
  label: string;
  /** Optional link so completed steps can be revisited. */
  href?: string;
}

export interface StepperProps {
  steps: Step[];
  /** Zero-based index of the current step. */
  current: number;
  label?: string;
  linkComponent?: React.ElementType;
  className?: string;
}

/** Progress through a multi-step flow such as checkout. */
export function Stepper({ steps, current, label, linkComponent: LinkTag = "a", className }: StepperProps) {
  const progress = useLabel("checkoutProgress", "Checkout progress");
  const completed = useLabel("completed", " (completed)");
  const notStarted = useLabel("notStarted", " (not started)");
  return (
    <nav aria-label={label || progress} className={cx(s.stepper, className)}>
      <ol>
        {steps.map((step, i) => {
          const state = i < current ? "complete" : i === current ? "current" : "upcoming";
          const body = (
            <>
              <span className={s.marker} aria-hidden="true">{state === "complete" ? <IconCheck size="sm" /> : i + 1}</span>
              <span className={s.label}>
                {step.label}
                {state === "complete" && <span className="visually-hidden">{completed}</span>}
                {state === "upcoming" && <span className="visually-hidden">{notStarted}</span>}
              </span>
            </>
          );
          return (
            <li key={step.label} className={s[state]} aria-current={state === "current" ? "step" : undefined}>
              {state === "complete" && step.href ? <LinkTag href={step.href} className={s.inner}>{body}</LinkTag> : <span className={s.inner}>{body}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
