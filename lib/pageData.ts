import { emptySiteTheme, type MegaMenuItem } from "@myproject/core";
import {
  emptyChrome,
  emptyFooter,
  getChrome,
  getFooter,
  getMegaMenu,
  getSite,
  type StoreChrome,
  type StoreFooter,
  type StoreScope,
  type StoreSite,
} from "./contentstack";
import { persistScope, scopeFor, scopeFrom } from "./scope";

export type PageDataContext = Parameters<typeof scopeFrom>[0];

export type GlobalPageData = {
  menuItems: MegaMenuItem[];
  menuLabel?: string;
  footer: StoreFooter;
  chrome: StoreChrome;
  site: StoreSite;
};

export const emptyGlobalPageData: GlobalPageData = {
  menuItems: [],
  footer: emptyFooter,
  chrome: emptyChrome,
  site: {
    ...emptySiteTheme,
    id: "",
    locale: "",
    locales: [],
    isDefault: false,
  },
};

export async function getGlobalPageData(
  ctx: PageDataContext
): Promise<{ global: GlobalPageData; scope: StoreScope }> {
  const preview = ctx.query?.live_preview;
  const livePreview = typeof preview === "string" ? preview : undefined;
  const requestedScope = { ...scopeFrom(ctx), livePreview };
  const site = await getSite(requestedScope);
  const scope = scopeFor(requestedScope, site);
  persistScope(ctx, scope);

  const [menu, footer, chrome] = await Promise.all([
    getMegaMenu(scope).catch(() => ({ items: [] as MegaMenuItem[], label: undefined })),
    getFooter(scope).catch(() => emptyFooter),
    getChrome(scope).catch(() => emptyChrome),
  ]);

  return {
    scope,
    global: {
      menuItems: menu.items,
      ...(menu.label ? { menuLabel: menu.label } : {}),
      footer,
      chrome,
      site,
    },
  };
}
