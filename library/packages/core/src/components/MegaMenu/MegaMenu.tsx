import * as React from "react";
import { Image } from "../Image/Image";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import s from "./MegaMenu.module.scss";

export interface MegaMenuLink {
  label: string;
  href: string;
}

export interface MegaMenuColumn {
  title: string;
  links: MegaMenuLink[];
}

export interface MegaMenuFeature {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export interface MegaMenuItem {
  id: string;
  label: string;
  href: string;
  current?: boolean;
  columns?: MegaMenuColumn[];
  features?: MegaMenuFeature[];
}

export interface MegaMenuProps {
  /** Names the list, e.g. "Departments". */
  label?: string;
  items: MegaMenuItem[];
  /** Id of the open panel. `null` closes it. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (id: string | null) => void;
  linkComponent?: React.ElementType;
  className?: string;
}

/**
 * Department bar with a full-width panel of link columns and featured tiles.
 * Hover or focus opens a panel. The first click opens it; a second click follows the link.
 * Escape closes it.
 */
export function MegaMenu({
  label = "Departments",
  items,
  value,
  defaultValue = null,
  onChange,
  linkComponent: LinkTag = "a",
  className,
}: MegaMenuProps) {
  const [active, setActive] = useControllableState(value, defaultValue, onChange);
  const base = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const suppressFocus = React.useRef(false);
  const openItem = items.find((item) => item.id === active && item.columns?.length);

  const close = () => setActive(null);

  React.useEffect(() => {
    if (!openItem) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      suppressFocus.current = true;
      setActive(null);
      rootRef.current?.querySelector<HTMLElement>(`[aria-controls="${base}-${openItem.id}"]`)?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openItem, base, setActive]);

  return (
    <div
      ref={rootRef}
      className={cx(s.root, className)}
      onMouseLeave={close}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <ul className={s.links} aria-label={label}>
        {items.map((item) => {
          const hasPanel = Boolean(item.columns?.length);
          const expanded = active === item.id;
          return (
            <li key={item.id} onMouseEnter={() => hasPanel && setActive(item.id)}>
              <LinkTag
                href={item.href}
                className={cx(s.link, expanded && s.linkOpen)}
                aria-current={item.current ? "page" : undefined}
                aria-expanded={hasPanel ? expanded : undefined}
                aria-controls={hasPanel ? `${base}-${item.id}` : undefined}
                onFocus={() => {
                  if (suppressFocus.current) {
                    suppressFocus.current = false;
                    return;
                  }
                  if (hasPanel) setActive(item.id);
                }}
                onClick={(event: React.MouseEvent) => {
                  if (!hasPanel || expanded) return;
                  event.preventDefault();
                  setActive(item.id);
                }}
              >
                {item.label}
              </LinkTag>
            </li>
          );
        })}
      </ul>
      {openItem && (
        <div id={`${base}-${openItem.id}`} className={s.panel} role="region" aria-label={`${openItem.label} menu`}>
          <div className={s.layout}>
            <div className={s.columns}>
              {openItem.columns?.map((column) => (
                <div key={column.title}>
                  <p className={s.columnTitle}>{column.title}</p>
                  <ul className={s.columnList}>
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <LinkTag href={link.href} className={s.columnLink}>{link.label}</LinkTag>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <LinkTag href={openItem.href} className={s.viewAll}>All {openItem.label}</LinkTag>
            </div>
            {openItem.features && openItem.features.length > 0 && (
              <div className={s.features}>
                {openItem.features.map((feature) => (
                  <LinkTag key={feature.title} href={feature.href} className={s.feature}>
                    <Image src={feature.imageSrc} alt={feature.imageAlt} aspectRatio="4/5" fit="cover" />
                    <span className={s.featureLabel}>{feature.title}</span>
                  </LinkTag>
                ))}
              </div>
            )}
          </div>
          <button type="button" className={s.close} onClick={close}>Close</button>
        </div>
      )}
    </div>
  );
}
