import * as React from "react";
import { IconChevronLeft, IconChevronRight, IconMenu, IconSearch } from "@myproject/icons";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import { Button } from "../Button/Button";
import { List, ListItem } from "../List/List";
import { Modal } from "../Modal/Modal";
import type { MegaMenuItem } from "../MegaMenu/MegaMenu";
import s from "./MobileMenu.module.scss";

export interface MobileMenuLink {
  id: string;
  label: string;
  href: string;
}

export interface MobileMenuProps {
  items: MegaMenuItem[];
  /** Extra links under the departments: sign in, rewards, stores. */
  links?: MobileMenuLink[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called instead of following `links`. The menu closes after. */
  onSelect?: (id: string) => void;
  /** Opens search and closes the menu. */
  onSearch?: () => void;
  className?: string;
}

const defaultLinks: MobileMenuLink[] = [
  { id: "sign-in", label: "Sign in", href: "#sign-in" },
  { id: "create-account", label: "Create an account", href: "#create-account" },
  { id: "rewards", label: "Online Store Example3 Rewards", href: "/#rewards" },
  { id: "wishlist", label: "Wishlist", href: "#wishlist" },
  { id: "track", label: "Track your order", href: "#track" },
  { id: "stores", label: "Find a store", href: "#stores" },
];

/**
 * Phone header menu. Departments open a second level; Back returns to the list.
 * Escape or Close dismisses it.
 */
export function MobileMenu({
  items,
  links = defaultLinks,
  open,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  onSearch,
  className,
}: MobileMenuProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const [section, setSection] = React.useState<string | null>(null);
  const active = items.find((item) => item.id === section);

  const close = () => {
    setOpen(false);
    setSection(null);
  };

  const choose = (link: MobileMenuLink) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect) return;
    event.preventDefault();
    onSelect(link.id);
    close();
  };

  return (
    <div className={cx(s.root, className)}>
      <button type="button" className={s.trigger} aria-expanded={isOpen} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <IconMenu />
        <span className="visually-hidden">Open menu</span>
      </button>
      <Modal open={isOpen} onClose={close} placement="fullscreen" title={active ? active.label : "Menu"}>
        {active ? (
          <div className={s.section}>
            <Button variant="tertiary" iconStart={<IconChevronLeft size="sm" />} onClick={() => setSection(null)}>
              Back
            </Button>
            {active.columns?.map((column) => (
              <div key={column.title}>
                <p className={s.columnTitle}>{column.title}</p>
                <List variant="plain" spacing="sm">
                  {column.links.map((link) => (
                    <ListItem key={link.label}>
                      <a href={link.href} onClick={close}>{link.label}</a>
                    </ListItem>
                  ))}
                </List>
              </div>
            ))}
            <a className={s.all} href={active.href} onClick={close}>All {active.label}</a>
          </div>
        ) : (
          <>
            <button
              type="button"
              className={s.search}
              onClick={() => {
                close();
                onSearch?.();
              }}
            >
              <IconSearch size="sm" />
              Search
            </button>
            <List variant="plain" className={s.departments}>
              {items.map((item) => (
                <ListItem key={item.id}>
                  <button type="button" className={s.department} onClick={() => setSection(item.id)}>
                    <span>{item.label}</span>
                    <IconChevronRight size="sm" />
                  </button>
                </ListItem>
              ))}
            </List>
            <List variant="plain" className={s.links}>
              {links.map((link) => (
                <ListItem key={link.id}>
                  <a href={link.href} onClick={choose(link)}>{link.label}</a>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Modal>
    </div>
  );
}
