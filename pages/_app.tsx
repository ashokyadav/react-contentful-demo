import { useEffect } from "react";
import App, { type AppContext, type AppProps } from "next/app";
import { SiteTheme, ToastProvider, type MegaMenuItem } from "@myproject/core";
import { CartProvider } from "../components/CartStore";
import { ChromeProvider } from "../components/ChromeContent";
import { FooterProvider } from "../components/FooterContent";
import { MenuProvider } from "../components/NavigationMenu";
import { SiteProvider } from "../components/SiteContext";
import { emptyChrome, emptyFooter, getChrome, getFooter, getMegaMenu, getSite, type StoreChrome, type StoreFooter, type StoreSite } from "../lib/contentstack";
import { persistScope, scopeFor, scopeFrom } from "../lib/scope";
import "@myproject/foundations/themes/global/na-core/tokens.css";
import "@myproject/foundations/styles/base.scss";
import "@myproject/foundations/styles/fonts.scss";

type Props = AppProps & {
  menuItems: MegaMenuItem[];
  menuLabel?: string;
  footer: StoreFooter;
  chrome: StoreChrome;
  site: StoreSite;
};

export default function StoreApp({ Component, pageProps, menuItems, menuLabel, footer, chrome, site }: Props) {
  useEffect(() => {
    const key = site.key || site.id;
    if (key) {
      sessionStorage.setItem("site", key);
      document.cookie = `site=${encodeURIComponent(key)}; Path=/; SameSite=Lax`;
    }
    if (site.locale) {
      sessionStorage.setItem("locale", site.locale);
      document.cookie = `locale=${encodeURIComponent(site.locale)}; Path=/; SameSite=Lax`;
    }
  }, [site.id, site.key, site.locale]);
  return (
    <SiteTheme theme={site}>
      <SiteProvider site={site}>
        <ToastProvider>
          <CartProvider>
            <MenuProvider items={menuItems} label={menuLabel}>
              <FooterProvider footer={footer}>
                <ChromeProvider chrome={chrome}>
                  <Component {...pageProps} />
                </ChromeProvider>
              </FooterProvider>
            </MenuProvider>
          </CartProvider>
        </ToastProvider>
      </SiteProvider>
    </SiteTheme>
  );
}

StoreApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  const preview = appContext.ctx.query.live_preview;
  const livePreview = typeof preview === "string" ? preview : undefined;
  const scope = { ...scopeFrom(appContext.ctx), livePreview };
  const site = await getSite(scope);
  const contentScope = scopeFor(scope, site);
  persistScope(appContext.ctx, contentScope);
  let menuItems: MegaMenuItem[] = [];
  let menuLabel: string | undefined;
  let footer = emptyFooter;
  let chrome = emptyChrome;
  try {
    const menu = await getMegaMenu(contentScope);
    menuItems = menu.items;
    menuLabel = menu.label;
  } catch {
    menuItems = [];
  }
  try {
    footer = await getFooter(contentScope);
  } catch {
    footer = emptyFooter;
  }
  try {
    chrome = await getChrome(contentScope);
  } catch {
    chrome = emptyChrome;
  }
  return { ...appProps, menuItems, menuLabel, footer, chrome, site };
};
