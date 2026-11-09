import { useEffect } from "react";
import { type AppProps } from "next/app";
import { LabelProvider, SiteTheme, ToastProvider } from "@myproject/core";
import { CartProvider } from "../components/CartStore";
import { ChromeProvider } from "../components/ChromeContent";
import { FooterProvider } from "../components/FooterContent";
import { MenuProvider } from "../components/NavigationMenu";
import { SiteProvider } from "../components/SiteContext";
import { emptyGlobalPageData, type GlobalPageData } from "../lib/pageData";
import "@myproject/foundations/themes/global/na-core/tokens.css";
import "@myproject/foundations/styles/base.scss";
import "@myproject/foundations/styles/fonts.scss";

export default function StoreApp({ Component, pageProps }: AppProps<{ global?: GlobalPageData }>) {
  const { menuItems, menuLabel, footer, chrome, site } = pageProps.global ?? emptyGlobalPageData;
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
        <LabelProvider labels={chrome.labels}>
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
        </LabelProvider>
      </SiteProvider>
    </SiteTheme>
  );
}
