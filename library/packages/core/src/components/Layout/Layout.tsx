import * as React from "react";
import { cx } from "../../utils/cx";
import { useLabel } from "../Labels/Labels";
import s from "./Layout.module.scss";

type Space = "none" | "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
const space = (v?: Space) => (v === undefined ? undefined : v === "none" ? "0" : `var(--spacing-${v})`);

/* ---------------- Container ---------------- */

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  as?: "div" | "section" | "main" | "article";
}

export function Container({ size = "lg", as: Tag = "div", className, style, ...rest }: ContainerProps) {
  return (
    <Tag
      className={cx(s.container, className)}
      style={{ maxWidth: size === "full" ? "none" : `var(--container-${size})`, ...style }}
      {...rest}
    />
  );
}

/* ---------------- Grid ---------------- */

type Responsive<T> = T | { base?: T; md?: T; lg?: T };

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  /** Column count, or responsive { base, md (≥768px), lg (≥1200px) }. */
  columns?: Responsive<number>;
  /** Auto-fill columns at least this wide (e.g. "16rem"); overrides `columns`. */
  minItemWidth?: string;
  gap?: Space;
  as?: "div" | "ul" | "ol" | "section";
}

export function Grid({ columns = 1, minItemWidth, gap = "md", as: Tag = "div", className, style, ...rest }: GridProps) {
  const c = typeof columns === "number" ? { base: columns } : columns;
  const vars = {
    "--grid-base": c.base ?? 1,
    "--grid-md": c.md ?? c.base ?? 1,
    "--grid-lg": c.lg ?? c.md ?? c.base ?? 1,
    "--grid-min": minItemWidth,
    gap: space(gap),
    ...style,
  } as React.CSSProperties;
  return <Tag className={cx(s.grid, minItemWidth && s.autoFill, className)} style={vars} {...rest} />;
}

export interface GridItemProps extends React.HTMLAttributes<HTMLElement> {
  span?: number;
  as?: "div" | "li";
}
export function GridItem({ span, as: Tag = "div", style, ...rest }: GridItemProps) {
  return <Tag style={{ gridColumn: span ? `span ${span} / span ${span}` : undefined, ...style }} {...rest} />;
}

/* ---------------- Flex ---------------- */

export interface FlexProps extends React.HTMLAttributes<HTMLElement> {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  wrap?: boolean;
  gap?: Space;
  inline?: boolean;
  as?: "div" | "ul" | "ol" | "section" | "span";
}

/**
 * Note: `*-reverse` changes visual order only. Keep DOM order matching reading
 * order so keyboard and screen-reader order stays logical (WCAG 1.3.2 / 2.4.3).
 */
export function Flex({ direction = "row", align, justify, wrap, gap = "none", inline, as: Tag = "div", className, style, ...rest }: FlexProps) {
  return (
    <Tag
      className={className}
      style={{
        display: inline ? "inline-flex" : "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
        gap: space(gap),
        ...style,
      }}
      {...rest}
    />
  );
}

/* ---------------- Header / Footer ---------------- */

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  /** Target of the "Skip to main content" link. Set to your <main> id. */
  mainContentId?: string;
}

/** Page banner landmark with a built-in skip link (WCAG 2.4.1). */
export function Header({ sticky, mainContentId = "main-content", className, children, ...rest }: HeaderProps) {
  const skip = useLabel("skip", "Skip to main content");
  return (
    <>
      <a href={`#${mainContentId}`} className={s.skipLink}>{skip}</a>
      <header className={cx(s.header, sticky && s.sticky, className)} {...rest}>{children}</header>
    </>
  );
}

export function Footer({ className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return <footer className={cx(s.footer, className)} {...rest} />;
}

/* ---------------- Sidebar ---------------- */

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Required: names the complementary landmark, e.g. "Filters". */
  label: string;
  position?: "start" | "end";
  width?: string;
  /** Main content next to the sidebar. Stacks below 768px. */
  main: React.ReactNode;
}

export function Sidebar({ label, position = "start", width = "16rem", main, className, children, style, ...rest }: SidebarProps) {
  return (
    <div className={cx(s.sidebarLayout, position === "end" && s.sidebarEnd, className)} style={{ "--sidebar-w": width, ...style } as React.CSSProperties}>
      <aside aria-label={label} className={s.sidebar} {...rest}>{children}</aside>
      <div className={s.sidebarContent}>{main}</div>
    </div>
  );
}

/* ---------------- Navigation ---------------- */

export interface NavigationItem {
  label: string;
  href: string;
  current?: boolean;
  icon?: React.ReactNode;
}

export interface NavigationProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Names the navigation landmark, e.g. "Account". Required when a page has more than one nav. */
  label: string;
  items: NavigationItem[];
  orientation?: "vertical" | "horizontal";
  /** Swap for next/link or a router Link. */
  linkComponent?: React.ElementType;
}

export function Navigation({ label, items, orientation = "vertical", linkComponent: LinkTag = "a", className, ...rest }: NavigationProps) {
  return (
    <nav aria-label={label} className={cx(s.nav, orientation === "horizontal" && s.navHorizontal, className)} {...rest}>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <LinkTag href={item.href} aria-current={item.current ? "page" : undefined} className={s.navLink}>
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </LinkTag>
          </li>
        ))}
      </ul>
    </nav>
  );
}
