import * as React from "react";
import { cx } from "../../utils/cx";
import s from "./Navbar.module.scss";

export interface NavbarLink {
  label: string;
  href: string;
  current?: boolean;
}

export interface NavbarProps {
  brand: React.ReactNode;
  /** Flat department links. Omit when `navigation` supplies a mega menu. */
  links?: NavbarLink[];
  /** Replaces `links`. Use this for a MegaMenu. */
  navigation?: React.ReactNode;
  /** Slim announcement above the bar, e.g. a sitewide offer. */
  banner?: React.ReactNode;
  /** Left side of the announcement bar, e.g. a rewards link. */
  bannerLeading?: React.ReactNode;
  /** Right side of the announcement bar, e.g. a locale switch. */
  bannerTrailing?: React.ReactNode;
  /** Sits to the left of the wordmark, e.g. search. Hidden below 960px. */
  start?: React.ReactNode;
  /** Menu button shown below 960px, in place of search and the department row. */
  menu?: React.ReactNode;
  /** Right-side utilities: account, bag. */
  actions?: React.ReactNode;
  label?: string;
  linkComponent?: React.ElementType;
  className?: string;
}

/** Store header: wordmark, department links, and the right-hand actions. */
export function Navbar({ brand, links = [], navigation, banner, bannerLeading, bannerTrailing, start, menu, actions, label = "Main", linkComponent: LinkTag = "a", className }: NavbarProps) {
  const id = React.useId();

  return (
    <div className={cx(s.navbar, className)}>
      {(banner || bannerLeading || bannerTrailing) && (
        <div className={s.banner}>
          <div className={s.bannerStart}>{bannerLeading}</div>
          <div className={s.bannerMain}>{banner}</div>
          <div className={s.bannerEnd}>{bannerTrailing}</div>
        </div>
      )}
      <div className={s.bar}>
        {menu ? <div className={s.menu}>{menu}</div> : null}
        <div className={s.start}>{start}</div>
        <div className={s.brand}>{brand}</div>
        <div className={s.actions}>{actions}</div>
      </div>
      <nav aria-label={label}>
        <div className={s.navRow}>
          {navigation ?? (
            <ul id={`${id}-links`} className={s.links}>
              {links.map((l) => (
                <li key={l.href}>
                  <LinkTag href={l.href} className={s.link} aria-current={l.current ? "page" : undefined}>{l.label}</LinkTag>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </div>
  );
}
