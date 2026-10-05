import * as React from "react";
import { cx } from "../../utils/cx";
import s from "./List.module.scss";

export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  ordered?: boolean;
  variant?: "bulleted" | "plain" | "divided";
  spacing?: "sm" | "md" | "lg";
}

/**
 * Note: Safari/VoiceOver drops list semantics when list-style is none.
 * For "plain" and "divided" we add role="list" back explicitly.
 */
export function List({ ordered, variant = "bulleted", spacing = "md", className, ...rest }: ListProps) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      role={variant === "bulleted" ? undefined : "list"}
      className={cx(s.list, s[variant], s[`space-${spacing}`], ordered && s.ordered, className)}
      {...(rest as React.HTMLAttributes<HTMLElement>)}
    />
  );
}

export interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "prefix"> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  description?: React.ReactNode;
}

export function ListItem({ prefix, suffix, description, className, children, ...rest }: ListItemProps) {
  if (!prefix && !suffix && !description) return <li className={className} {...rest}>{children}</li>;
  return (
    <li className={cx(s.rich, className)} {...rest}>
      {prefix && <span className={s.prefix}>{prefix}</span>}
      <span className={s.main}>
        <span>{children}</span>
        {description && <span className={s.description}>{description}</span>}
      </span>
      {suffix && <span className={s.suffix}>{suffix}</span>}
    </li>
  );
}
