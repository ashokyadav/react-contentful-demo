import * as React from "react";
import { cx } from "../../utils/cx";
import s from "./Price.module.scss";

export interface PriceProps {
  /** Current price in major units, e.g. 598.5. */
  value: number;
  /** Original price. Shown struck through when it is higher than `value`. */
  compareAt?: number;
  currency?: string;
  locale?: string;
  className?: string;
}

function format(amount: number, currency: string, locale: string) {
  const digits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

/** Current price, with the previous price struck through when the item is on sale. */
export function Price({ value, compareAt, currency = "USD", locale = "en-US", className }: PriceProps) {
  const onSale = compareAt !== undefined && compareAt > value;
  const current = format(value, currency, locale);
  const previous = onSale ? format(compareAt, currency, locale) : undefined;
  return (
    <p className={cx(s.price, className)}>
      <span className="visually-hidden">
        {previous ? `Sale price ${current}, original price ${previous}` : current}
      </span>
      <span aria-hidden="true" className={s.current}>{current}</span>
      {previous && <s aria-hidden="true" className={s.compare}>{previous}</s>}
    </p>
  );
}
