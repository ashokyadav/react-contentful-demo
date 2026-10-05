import * as React from "react";
import { cx } from "../../utils/cx";
import type { HeadingLevel } from "../../utils/types";
import s from "./Card.module.scss";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  /** Match the page outline — card titles are usually h3 inside an h2 section. */
  headingLevel?: HeadingLevel;
  media?: React.ReactNode;
  eyebrow?: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Makes the whole card clickable via the title link (stretched-link pattern):
   * one link, one tab stop, a sensible accessible name. Other interactive
   * elements inside stay independently clickable.
   */
  href?: string;
  variant?: "plain" | "outlined" | "filled";
  linkComponent?: React.ElementType;
}

export function Card({
  title, headingLevel = 3, media, eyebrow, footer, href, variant = "plain",
  linkComponent: LinkTag = "a", className, children, ...rest
}: CardProps) {
  const H = `h${headingLevel}` as const;
  return (
    <article className={cx(s.card, s[variant], href && s.linked, className)} {...rest}>
      {media && <div className={s.media}>{media}</div>}
      <div className={s.body}>
        <H className={s.title}>
          {href ? <LinkTag href={href} className={s.link}>{title}</LinkTag> : title}
        </H>
        {/* Eyebrow sits after the title in DOM so the heading is announced first; CSS lifts it visually. */}
        {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}
        {children && <div className={s.content}>{children}</div>}
        {footer && <div className={s.footer}>{footer}</div>}
      </div>
    </article>
  );
}
