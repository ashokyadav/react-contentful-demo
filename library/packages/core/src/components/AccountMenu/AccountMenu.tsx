import * as React from "react";
import { IconUser } from "@myproject/icons";
import { useLabel } from "../Labels/Labels";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import s from "./AccountMenu.module.scss";

export interface AccountAction {
  id: string;
  label: string;
  href: string;
}

export interface AccountMenuProps {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called instead of following the link. The panel closes after. */
  onSelect?: (id: string) => void;
  signIn?: AccountAction;
  createAccount?: AccountAction;
  rewardsTitle?: string;
  rewardsLine?: string;
  enroll?: AccountAction;
  learnMore?: AccountAction;
  links?: AccountAction[];
  className?: string;
}

const defaults = {
  signIn: { id: "sign-in", label: "Sign In", href: "#sign-in" },
  createAccount: { id: "create-account", label: "Create an Account", href: "#create-account" },
  rewardsTitle: "Online Store Example3 Rewards",
  rewardsLine: "Earn up to 10x rewards",
  enroll: { id: "enroll", label: "Enroll Now", href: "/#rewards" },
  learnMore: { id: "learn-more", label: "Learn More", href: "/#rewards" },
  links: [
    { id: "wishlist", label: "Wishlist", href: "#wishlist" },
    { id: "track", label: "Track Your Order", href: "#track" },
  ],
};

/**
 * Account panel anchored to the user icon: sign in, rewards, wishlist, and order tracking.
 * Click the icon to open. Escape or a click outside closes it.
 */
export function AccountMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  signIn = defaults.signIn,
  createAccount = defaults.createAccount,
  rewardsTitle = defaults.rewardsTitle,
  rewardsLine = defaults.rewardsLine,
  enroll = defaults.enroll,
  learnMore = defaults.learnMore,
  links = defaults.links,
  className,
}: AccountMenuProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const panelId = React.useId();

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [isOpen, setOpen]);

  const choose = (action: AccountAction) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect) return;
    event.preventDefault();
    onSelect(action.id);
    setOpen(false);
  };
  const account = useLabel("account", "Account");
  const login = useLabel("login", "Login");

  return (
    <div ref={rootRef} className={cx(s.root, className)}>
      <button
        type="button"
        className={s.trigger}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpen(!isOpen)}
      >
        <IconUser />
        <span className="visually-hidden">{account}</span>
      </button>
      {isOpen ? <span className={s.login}>{login}</span> : null}
      {isOpen ? (
        <div id={panelId} role="dialog" aria-label={account} className={s.panel}>
          <ul className={s.list}>
            <li><a href={signIn.href} onClick={choose(signIn)}>{signIn.label}</a></li>
            <li><a href={createAccount.href} onClick={choose(createAccount)}>{createAccount.label}</a></li>
          </ul>
          <div className={s.rewards}>
            <p className={s.kicker}>{rewardsTitle}</p>
            <p className={s.earn}>{rewardsLine}</p>
            <p className={s.rewardLinks}>
              <a href={enroll.href} onClick={choose(enroll)}>{enroll.label}</a>
              <a href={learnMore.href} onClick={choose(learnMore)}>{learnMore.label}</a>
            </p>
          </div>
          <ul className={s.list}>
            {links.map((link) => (
              <li key={link.id}><a href={link.href} onClick={choose(link)}>{link.label}</a></li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
