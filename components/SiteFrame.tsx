import { useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import {
  AccountMenu,
  Autocomplete,
  Badge,
  Button,
  Container,
  Footer,
  Form,
  Header,
  List,
  ListItem,
  MegaMenu,
  MobileMenu,
  Modal,
  Navbar,
  TextInput,
  useToast,
} from "@myproject/core";
import { useCart } from "./CartStore";
import { useChrome } from "./ChromeContent";
import { useSite } from "./SiteContext";
import { useFooter } from "./FooterContent";
import { useNavigationMenu } from "./NavigationMenu";
import { IconBag, IconChevronLeft, IconChevronRight, IconPin, IconSearch } from "@myproject/icons";
import styles from "../styles/home.module.scss";

function hrefWithLocale(asPath: string, siteKey: string, locale: string) {
  const [path, hash = ""] = asPath.split("#");
  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  if (siteKey) params.set("site", siteKey);
  params.set("locale", locale);
  const query = params.toString();
  return `${pathname || "/"}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

function PromoTicker({ offers, previousLabel, nextLabel }: { offers: { label: string; links: { href: string; label: string }[] }[]; previousLabel: string; nextLabel: string }) {
  const [index, setIndex] = useState(0);
  const offer = offers[index] || offers[0];
  if (!offer) return null;
  const step = (dir: number) => setIndex((n) => (n + dir + offers.length) % offers.length);
  return (
    <div className={styles.ticker}>
      <button type="button" className={styles.tickerButton} aria-label={previousLabel} onClick={() => step(-1)}>
        <IconChevronLeft size="sm" />
      </button>
      <p>
        <span>{offer.label}</span>
        {offer.links.map((link) => (
          <a key={link.label} href={link.href}>{link.label}</a>
        ))}
      </p>
      <button type="button" className={styles.tickerButton} aria-label={nextLabel} onClick={() => step(1)}>
        <IconChevronRight size="sm" />
      </button>
    </div>
  );
}

export function SiteFrame({ children, current = "", showBanner = true }: { children: ReactNode; current?: string; showBanner?: boolean }) {
  const site = useSite();
  const chrome = useChrome();
  const router = useRouter();
  const { show } = useToast();
  const { count } = useCart();
  const footer = useFooter();
  const [search, setSearch] = useState(false);
  const { items: menus, label: menuLabel } = useNavigationMenu();
  const bagLabel = `${chrome.bagName}, ${count} ${count === 1 ? chrome.bagOne : chrome.bagMany}`;
  const rewards = `${site.name} ${chrome.rewardsSuffix}`.trim();
  const localeChoices = site.locales.length > 1 ? site.locales : [];

  const departmentHref = menus.find((item) => item.href.startsWith("/clothing"))?.href || "/account";
  const openAccount = (id: string) => {
    if (id === "sign-in" || id === "enroll" || id === "learn-more" || id === "wishlist" || id === "rewards") {
      router.push("/account");
      return;
    }
    if (id === "create-account") {
      router.push("/account/create");
      return;
    }
    if (id === "track") {
      router.push("/account?view=orders");
      return;
    }
    if (id === "stores") {
      router.push(departmentHref);
      return;
    }
    show({ message: chrome.notes[id] || chrome.notes.account || "" });
  };

  const iconButton = (label: string, icon: ReactNode, onClick?: () => void) =>
    onClick ? (
      <button type="button" className={styles.iconButton} onClick={onClick}>
        {icon}
        <span className="visually-hidden">{label}</span>
      </button>
    ) : (
      <a href={`#${label}`} className={styles.iconButton}>
        {icon}
        <span className="visually-hidden">{label}</span>
      </a>
    );

  return (
    <>
      <Header sticky className={styles.siteHeader} mainContentId="main">
        <Navbar
          banner={showBanner && chrome.offers.length > 0 ? <PromoTicker offers={chrome.offers} previousLabel={chrome.previousOffer} nextLabel={chrome.nextOffer} /> : undefined}
          bannerLeading={showBanner ? <a href="/account">{rewards}</a> : undefined}
          bannerTrailing={showBanner && localeChoices.length > 0 ? (
            <span className={styles.locales}>
              {localeChoices.map((code) => (
                <a
                  key={code}
                  href={hrefWithLocale(router.asPath, site.key, code)}
                  hrefLang={code === "fr-fr" ? "fr" : "en"}
                  aria-current={site.locale === code ? "true" : undefined}
                >
                  {chrome.localeLabels.find((item) => item.code === code)?.label || code}
                </a>
              ))}
            </span>
          ) : undefined}
          start={(
            <form
              className={styles.search}
              onSubmit={(event) => {
                event.preventDefault();
                setSearch(true);
              }}
            >
              <IconSearch size="sm" />
              <TextInput
                hideLabel
                label={chrome.searchLabel}
                placeholder={chrome.placeholder}
                fieldClassName={styles.searchField}
                className={styles.searchInput}
              />
            </form>
          )}
          menu={(
            <MobileMenu
              items={menus}
              links={[
                { id: "sign-in", label: chrome.signIn, href: "/account" },
                { id: "create-account", label: chrome.createAccount, href: "/account/create" },
                { id: "rewards", label: rewards, href: "/account" },
                { id: "wishlist", label: chrome.wishlist, href: "/account" },
                { id: "track", label: chrome.track, href: "/account?view=orders" },
                { id: "stores", label: chrome.storeLabel, href: departmentHref },
              ]}
              onSearch={() => setSearch(true)}
              onSelect={openAccount}
            />
          )}
          brand={<a href={hrefWithLocale("/", site.key, site.locale)} className={styles.wordmark}>{site.name}</a>}
          navigation={(
            <MegaMenu
              label={menuLabel}
              items={menus.map((item) => ({ ...item, current: item.label === current }))}
            />
          )}
          actions={
            <>
              <span className={styles.desktopOnly}>
                <a href={departmentHref} className={styles.iconButton}>
                  <IconPin />
                  <span className="visually-hidden">{chrome.storeLabel}</span>
                </a>
              </span>
              <button type="button" className={`${styles.iconButton} ${styles.mobileOnly}`} onClick={() => setSearch(true)}>
                <IconSearch />
                <span className="visually-hidden">{chrome.searchLabel}</span>
              </button>
              <span className={styles.desktopOnly}>
                <AccountMenu
                  rewardsTitle={rewards}
                  rewardsLine={chrome.rewardsLine}
                  signIn={{ id: "sign-in", label: chrome.signIn, href: "/account" }}
                  createAccount={{ id: "create-account", label: chrome.createAccount, href: "/account/create" }}
                  enroll={{ id: "enroll", label: chrome.enroll, href: "/account" }}
                  learnMore={{ id: "learn-more", label: chrome.learnMore, href: "/account" }}
                  links={[
                    { id: "wishlist", label: chrome.wishlist, href: "/account" },
                    { id: "track", label: chrome.track, href: "/account?view=orders" },
                  ]}
                  onSelect={openAccount}
                />
              </span>
              <a href="/cart" className={`${styles.iconButton} ${styles.bagButton}`}>
                <IconBag />
                {count > 0 && <Badge count={count} className={styles.bagCount} />}
                <span className="visually-hidden">{bagLabel}</span>
              </a>
            </>
          }
        />
      </Header>
      {children}
      <Footer className={styles.footer}>
        <Container>
          {footer.columns.length > 0 && (
            <div className={styles.footerGrid}>
              {footer.columns.map((column) => (
                <div key={column.title}>
                  <h2 className={styles.footerTitle}>{column.title}</h2>
                  <List variant="plain" spacing="sm">
                    {column.links.map((link) => (
                      <ListItem key={`${column.title}-${link.label}`}>
                        <a href={link.href}>{link.label}</a>
                      </ListItem>
                    ))}
                  </List>
                </div>
              ))}
            </div>
          )}
          {footer.signup && (
            <Form
              id="signup"
              className={styles.signup}
              onSubmit={(event) => {
                event.preventDefault();
                show({ tone: "success", message: footer.signup?.message || "" });
              }}
            >
              <TextInput
                fieldClassName={styles.signupField}
                label={footer.signup.label}
                type="email"
                autoComplete="email"
                required
                placeholder={footer.signup.placeholder}
              />
              <Button type="submit" variant="secondary">{footer.signup.action}</Button>
            </Form>
          )}
          {footer.copyright && <p className={styles.legal}>{footer.copyright}</p>}
        </Container>
      </Footer>
      <Modal open={search} onClose={() => setSearch(false)} title={chrome.searchTitle} size="sm">
        <Autocomplete label={chrome.searchLabel} placeholder={chrome.placeholder} options={chrome.suggestions} />
      </Modal>
    </>
  );
}
