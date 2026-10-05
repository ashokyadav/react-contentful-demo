import * as React from "react";
import { cx } from "../../utils/cx";
import s from "./Breadcrumbs.module.scss";

export interface Crumb {
  label: string;
  /** Omit on the last item (current page). */
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  label?: string;
  linkComponent?: React.ElementType;
  className?: string;
}

export function Breadcrumbs({ items, label = "Breadcrumb", linkComponent: LinkTag = "a", className }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className={cx(s.breadcrumbs, className)}>
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`}>
              {last || !c.href ? (
                <span aria-current={last ? "page" : undefined}>{c.label}</span>
              ) : (
                <LinkTag href={c.href}>{c.label}</LinkTag>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
