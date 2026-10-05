import * as React from "react";
import { IconChevronDown } from "@myproject/icons";
import { useControllableState } from "../../utils/useControllableState";
import type { HeadingLevel } from "../../utils/types";
import { cx } from "../../utils/cx";
import s from "./Accordion.module.scss";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** When true, more than one panel can be open. Product-detail sections use this. */
  multiple?: boolean;
  /** Ids of the open panels. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (open: string[]) => void;
  /** Heading level for each panel title. Use 2 under the product name. */
  headingLevel?: HeadingLevel;
  className?: string;
}

/** Stacked disclosures. Each heading is a button; closed panels are removed from the accessibility tree. */
export function Accordion({ items, multiple = true, value, defaultValue = [], onChange, headingLevel = 2, className }: AccordionProps) {
  const [open, setOpen] = useControllableState(value, defaultValue, onChange);
  const base = React.useId();
  const Heading = `h${headingLevel}` as const;

  const toggle = (id: string) => {
    const isOpen = open.includes(id);
    if (multiple) setOpen(isOpen ? open.filter((x) => x !== id) : [...open, id]);
    else setOpen(isOpen ? [] : [id]);
  };

  return (
    <div className={cx(s.accordion, className)}>
      {items.map((item) => {
        const expanded = open.includes(item.id);
        const panelId = `${base}-${item.id}-panel`;
        const buttonId = `${base}-${item.id}-button`;
        return (
          <div key={item.id} className={s.item}>
            <Heading className={s.heading}>
              <button
                type="button"
                id={buttonId}
                className={s.trigger}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span>{item.title}</span>
                <IconChevronDown className={cx(s.icon, expanded && s.iconOpen)} size="sm" />
              </button>
            </Heading>
            <div id={panelId} role="region" aria-labelledby={buttonId} className={s.panel} hidden={!expanded}>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
