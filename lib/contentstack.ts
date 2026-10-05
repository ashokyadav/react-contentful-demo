import { emptySiteTheme, type MegaMenuItem, type SiteThemeValue } from "@myproject/core";

export type StoreScope = {
  site?: string;
  siteUid?: string;
  locale?: string;
  livePreview?: string;
};

type SiteRef = { uid?: string } | string;

export function asScope(value?: StoreScope | string): StoreScope {
  if (typeof value === "string") return { livePreview: value };
  return value ?? {};
}

function siteIds(sites?: SiteRef[]) {
  return (sites ?? []).flatMap((site) => {
    const id = typeof site === "string" ? site : site?.uid || "";
    return id ? [id] : [];
  });
}

export function entryMatchesSite(sites: SiteRef[] | undefined, siteUid: string) {
  if (!siteUid) return true;
  const ids = siteIds(sites);
  return ids.length === 0 || ids.includes(siteUid);
}

export function pickScoped<T extends { sites?: SiteRef[] }>(entries: T[], siteUid: string): T | undefined {
  if (!entries.length) return undefined;
  if (siteUid) {
    const specific = entries.find((entry) => siteIds(entry.sites).includes(siteUid));
    if (specific) return specific;
  }
  return entries.find((entry) => siteIds(entry.sites).length === 0);
}

function stackHeaders(apiKey: string, token: string, preview: boolean): Record<string, string> {
  return preview
    ? { api_key: apiKey, preview_token: token }
    : { api_key: apiKey, access_token: token };
}

function applyScope(url: URL, scope?: StoreScope) {
  const locale = scope?.locale || "en-us";
  url.searchParams.set("locale", locale);
  if (scope?.livePreview) url.searchParams.set("live_preview", scope.livePreview);
}

type CsLink = {
  title?: string;
  href?: string;
  label?: string;
  url?: string | { href?: string; title?: string };
};

type CsColumn = {
  title?: string;
  links?: CsLink | CsLink[];
};

type CsFeature = {
  title?: string;
  url?: string | { href?: string };
  image?: { url?: string } | null;
  image_alt?: string;
};

type CsDepartment = {
  uid?: string;
  title?: string;
  label?: string;
  department_key?: string;
  url?: string;
  columns?: CsColumn[];
  features?: CsFeature[];
};

type CsMenu = {
  title?: string;
  accessible_name?: string;
  departments?: CsDepartment[];
  sites?: SiteRef[];
};

function hrefOf(value: CsLink["url"] | string | undefined): string {
  if (typeof value === "string") return value;
  if (value && typeof value.href === "string") return value.href;
  return "";
}

function linkOf(value: CsLink | undefined): { label: string; href: string } | null {
  if (!value) return null;
  const label = value.title || value.label || "";
  const href = value.href || hrefOf(value.url);
  if (!label || !href) return null;
  return { label, href };
}

function linksOf(value: CsColumn["links"]): { label: string; href: string }[] {
  if (Array.isArray(value)) return value.flatMap((link) => {
    const mapped = linkOf(link);
    return mapped ? [mapped] : [];
  });
  const mapped = linkOf(value);
  return mapped ? [mapped] : [];
}

function columnsOf(columns: CsColumn[] | undefined): MegaMenuItem["columns"] {
  const grouped: { title: string; links: { label: string; href: string }[] }[] = [];
  for (const column of columns ?? []) {
    const links = linksOf(column.links);
    if (!links.length) continue;
    const title = column.title || "Links";
    const previous = grouped[grouped.length - 1];
    if (previous && previous.title === title) previous.links.push(...links);
    else grouped.push({ title, links: [...links] });
  }
  return grouped;
}

function featuresOf(features: CsFeature[] | undefined): MegaMenuItem["features"] {
  return (features ?? []).flatMap((feature) => {
    const href = hrefOf(feature.url);
    if (!feature.title || !href) return [];
    return [{
      title: feature.title,
      href,
      imageSrc: feature.image?.url || "",
      imageAlt: feature.image_alt || feature.title,
    }];
  });
}

export function toMegaMenu(entry: CsMenu | undefined): { label?: string; items: MegaMenuItem[] } {
  const departments = (entry?.departments ?? []).filter((department) => department && department.uid);
  const items = departments.map((department) => ({
    id: department.department_key || department.uid || department.title || "department",
    label: department.label || department.title || "Department",
    href: department.url || "#",
    columns: columnsOf(department.columns),
    features: featuresOf(department.features),
  }));
  const label = entry?.accessible_name?.trim();
  return { label: label || undefined, items };
}

export async function getMegaMenu(scopeOrPreview?: StoreScope | string): Promise<{ label?: string; items: MegaMenuItem[] }> {
  const scope = asScope(scopeOrPreview);
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
  const previewToken = process.env.CONTENTSTACK_PREVIEW_TOKEN;
  if (!apiKey || !deliveryToken) return { items: [] };

  const preview = Boolean(scope.livePreview && previewToken);
  const host = preview
    ? process.env.CONTENTSTACK_PREVIEW_HOST || "https://eu-rest-preview.contentstack.com"
    : process.env.CONTENTSTACK_CDN || "https://eu-cdn.contentstack.com";
  const headers = stackHeaders(apiKey, preview ? previewToken! : deliveryToken, preview);
  const siteUid = scope.siteUid || "";

  const load = async (locale?: string) => {
    const url = new URL("/v3/content_types/mega_menu/entries", host);
    url.searchParams.append("include[]", "departments");
    applyScope(url, scope);
    if (locale) url.searchParams.set("locale", locale);
    const response = await fetch(url, { headers, cache: "no-store" });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Contentstack ${response.status}: ${detail.slice(0, 180)}`);
    }
    const body = await response.json() as { entries?: CsMenu[] };
    return pickScoped(body.entries ?? [], siteUid);
  };

  let entry = await load();
  if (!entry && scope.locale && scope.locale !== "en-us") entry = await load("en-us");
  return toMegaMenu(entry);
}

export type StoreFooterLink = { label: string; href: string };

export type StoreFooter = {
  columns: { title: string; links: StoreFooterLink[] }[];
  copyright: string;
  legal: StoreFooterLink[];
  signup: { label: string; placeholder: string; action: string; message: string } | null;
};

export const emptyFooter: StoreFooter = { columns: [], copyright: "", legal: [], signup: null };

type CsFooterItem = { title?: string; url?: string; column?: string; rank?: number; sites?: SiteRef[] };
type CsFooterLink = { label?: string; url?: string };
type CsFooter = {
  sites?: SiteRef[];
  copyright?: string;
  legal?: CsFooterLink[];
  signup?: { label?: string; placeholder?: string; action?: string; message?: string };
};

function footerLinks(links: CsFooterLink[] | undefined): StoreFooterLink[] {
  return (links ?? []).flatMap((link) => {
    const label = link.label?.trim() || "";
    const href = link.url?.trim() || "";
    return label && href ? [{ label, href }] : [];
  });
}

function footerColumns(items: CsFooterItem[]): StoreFooter["columns"] {
  const columns: StoreFooter["columns"] = [];
  const sorted = [...items].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  for (const item of sorted) {
    const label = item.title?.trim() || "";
    const href = item.url?.trim() || "";
    const title = item.column?.trim() || "";
    if (!label || !href || !title) continue;
    const existing = columns.find((column) => column.title === title);
    if (existing) existing.links.push({ label, href });
    else columns.push({ title, links: [{ label, href }] });
  }
  return columns;
}

function footerOf(entry: CsFooter | undefined, items: CsFooterItem[]): StoreFooter {
  const signup = entry?.signup;
  const label = signup?.label?.trim() || "";
  const placeholder = signup?.placeholder?.trim() || "";
  const action = signup?.action?.trim() || "";
  const message = signup?.message?.trim() || "";
  return {
    columns: footerColumns(items),
    copyright: entry?.copyright?.trim() || "",
    legal: footerLinks(entry?.legal),
    signup: label && placeholder && action && message ? { label, placeholder, action, message } : null,
  };
}

export async function getFooter(scopeOrPreview?: StoreScope | string): Promise<StoreFooter> {
  const scope = asScope(scopeOrPreview);
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
  const previewToken = process.env.CONTENTSTACK_PREVIEW_TOKEN;
  if (!apiKey || !deliveryToken) return emptyFooter;

  const preview = Boolean(scope.livePreview && previewToken);
  const host = preview
    ? process.env.CONTENTSTACK_PREVIEW_HOST || "https://eu-rest-preview.contentstack.com"
    : process.env.CONTENTSTACK_CDN || "https://eu-cdn.contentstack.com";
  const headers = stackHeaders(apiKey, preview ? previewToken! : deliveryToken, preview);

  const load = async <T,>(pathname: string, asc?: string): Promise<T> => {
    const url = new URL(pathname, host);
    if (asc) url.searchParams.set("asc", asc);
    applyScope(url, scope);
    const response = await fetch(url, { headers, cache: "no-store" });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Contentstack ${response.status}: ${detail.slice(0, 180)}`);
    }
    return response.json() as Promise<T>;
  };

  const [footerBody, itemBody] = await Promise.all([
    load<{ entries?: CsFooter[] }>("/v3/content_types/footer/entries"),
    load<{ entries?: CsFooterItem[] }>("/v3/content_types/footer_item/entries", "rank"),
  ]);
  const footerEntry = pickScoped(footerBody.entries ?? [], scope.siteUid || "");
  const items = (itemBody.entries ?? []).filter((item) => entryMatchesSite(item.sites, scope.siteUid || ""));
  return footerOf(footerEntry, items);
}

export type StorePanel = {
  id: string;
  title: string;
  text?: string;
  image: string;
  alt: string;
  action: { label: string; href: string };
};

type CsHomePanel = {
  sites?: SiteRef[];
  title?: string;
  text?: string;
  image?: string;
  image_alt?: string;
  action_label?: string;
  action_url?: string;
  anchor?: string;
  rank?: number;
};

function panelOf(entry: CsHomePanel): StorePanel | null {
  const title = entry.title?.trim() || "";
  const image = entry.image?.trim() || "";
  const label = entry.action_label?.trim() || "";
  const href = entry.action_url?.trim() || "";
  const id = entry.anchor?.trim() || "";
  if (!title || !image || !label || !href || !id) return null;
  const text = entry.text?.trim();
  return {
    id,
    title,
    ...(text ? { text } : {}),
    image,
    alt: entry.image_alt?.trim() || title,
    action: { label, href },
  };
}

export async function getHomePanels(scopeOrPreview?: StoreScope | string): Promise<StorePanel[]> {
  const scope = asScope(scopeOrPreview);
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
  const previewToken = process.env.CONTENTSTACK_PREVIEW_TOKEN;
  if (!apiKey || !deliveryToken) return [];

  const preview = Boolean(scope.livePreview && previewToken);
  const host = preview
    ? process.env.CONTENTSTACK_PREVIEW_HOST || "https://eu-rest-preview.contentstack.com"
    : process.env.CONTENTSTACK_CDN || "https://eu-cdn.contentstack.com";
  const url = new URL("/v3/content_types/home_panel/entries", host);
  url.searchParams.set("asc", "rank");
  applyScope(url, scope);
  const response = await fetch(url, {
    headers: stackHeaders(apiKey, preview ? previewToken! : deliveryToken, preview),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Contentstack ${response.status}: ${detail.slice(0, 180)}`);
  }
  const body = await response.json() as { entries?: CsHomePanel[] };
  return (body.entries ?? []).flatMap((entry) => {
    if (!entryMatchesSite(entry.sites, scope.siteUid || "")) return [];
    const panel = panelOf(entry);
    return panel ? [panel] : [];
  });
}

export type StoreSwatch = { label: string; value: string; image?: string; alt?: string };

export type StoreHomeCard = {
  title: string;
  href: string;
  price: number;
  compareAt?: number;
  image: string;
  alt: string;
  fit?: "contain";
  swatches?: StoreSwatch[];
};

export type StoreHomeAction = { label: string; href: string };

export type StoreHome = {
  hero: {
    kicker: string;
    offer: string;
    note: string;
    fine: string;
    details?: string;
    image: string;
    imageAlt: string;
    actions: StoreHomeAction[];
  } | null;
  arrivals: {
    id: string;
    title: string;
    text: string;
    action: StoreHomeAction;
    products: StoreHomeCard[];
  } | null;
  feature: {
    id: string;
    title: string;
    text: string;
    action: StoreHomeAction;
    images: { src: string; alt: string }[];
  } | null;
  products: {
    id: string;
    label: string;
    products: StoreHomeCard[];
  } | null;
  services: {
    id: string;
    label: string;
    stories: { title: string; text: string; image: string; alt: string; href: string }[];
  } | null;
  heritage: { mark: string; text: string } | null;
  offer: {
    chip: string;
    title: string;
    description: string;
    body: string;
    closeLabel: string;
    dismissLabel: string;
  } | null;
};

export const emptyHome: StoreHome = {
  hero: null,
  arrivals: null,
  feature: null,
  products: null,
  services: null,
  heritage: null,
  offer: null,
};

type CsAction = { label?: string; url?: string };
type CsCard = {
  title?: string;
  url?: string;
  price?: number;
  compare_at?: number;
  image?: unknown;
  image_alt?: string;
  fit?: string;
  swatches?: string[] | string;
};
type CsHero = {
  kicker?: string;
  offer?: string;
  note?: string;
  fine?: string;
  details?: string;
  image?: unknown;
  image_alt?: string;
  actions?: CsAction[];
};
type CsBand = {
  heading?: string;
  text?: string;
  action_label?: string;
  action_url?: string;
  anchor?: string;
  products?: CsCard[];
  images?: { image?: unknown; image_alt?: string }[];
};
type CsRow = { label?: string; anchor?: string; products?: CsCard[] };
type CsServices = {
  label?: string;
  anchor?: string;
  stories?: { title?: string; text?: string; image?: unknown; image_alt?: string; url?: string }[];
};
type CsHeritage = { mark?: string; text?: string };
type CsOffer = {
  chip?: string;
  modal_title?: string;
  description?: string;
  body?: string;
  close_label?: string;
  dismiss_label?: string;
};

function textValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "url" in value && typeof (value as { url?: unknown }).url === "string") {
    return (value as { url: string }).url.trim();
  }
  return "";
}

function actionOf(label?: string, href?: unknown): StoreHomeAction | null {
  const name = label?.trim() || "";
  const url = textValue(href);
  return name && url ? { label: name, href: url } : null;
}

function cardOf(entry: CsCard): StoreHomeCard | null {
  const title = entry.title?.trim() || "";
  const href = textValue(entry.url);
  const image = textValue(entry.image);
  if (!title || !href || !image || typeof entry.price !== "number") return null;
  return {
    title,
    href,
    price: entry.price,
    ...(typeof entry.compare_at === "number" ? { compareAt: entry.compare_at } : {}),
    image,
    alt: entry.image_alt?.trim() || title,
    ...(entry.fit === "contain" ? { fit: "contain" as const } : {}),
  };
}

function heroOf(entry: CsHero | undefined): StoreHome["hero"] {
  const image = textValue(entry?.image);
  const kicker = entry?.kicker?.trim() || "";
  const offer = entry?.offer?.trim() || "";
  const note = entry?.note?.trim() || "";
  const fine = entry?.fine?.trim() || "";
  if (!entry || !kicker || !offer || !note || !fine || !image) return null;
  const details = entry.details?.trim();
  return {
    kicker,
    offer,
    note,
    fine,
    ...(details ? { details } : {}),
    image,
    imageAlt: entry.image_alt?.trim() || kicker,
    actions: (entry.actions ?? []).flatMap((action) => {
      const mapped = actionOf(action.label, action.url);
      return mapped ? [mapped] : [];
    }),
  };
}

function arrivalsOf(entry: CsBand | undefined): StoreHome["arrivals"] {
  const action = actionOf(entry?.action_label, entry?.action_url);
  const title = entry?.heading?.trim() || "";
  const text = entry?.text?.trim() || "";
  const id = entry?.anchor?.trim() || "";
  if (!action || !title || !text || !id) return null;
  return {
    id,
    title,
    text,
    action,
    products: (entry?.products ?? []).flatMap((product) => {
      const card = cardOf(product);
      return card ? [card] : [];
    }),
  };
}

function featureOf(entry: CsBand | undefined): StoreHome["feature"] {
  const action = actionOf(entry?.action_label, entry?.action_url);
  const title = entry?.heading?.trim() || "";
  const text = entry?.text?.trim() || "";
  const id = entry?.anchor?.trim() || "";
  const images = (entry?.images ?? []).flatMap((image) => {
    const src = textValue(image.image);
    if (!src) return [];
    return [{ src, alt: image.image_alt?.trim() || title }];
  });
  if (!action || !title || !text || !id || !images.length) return null;
  return { id, title, text, action, images };
}

function rowOf(entry: CsRow | undefined): StoreHome["products"] {
  const label = entry?.label?.trim() || "";
  const id = entry?.anchor?.trim() || "";
  const products = (entry?.products ?? []).flatMap((product) => {
    const card = cardOf(product);
    return card ? [card] : [];
  });
  if (!label || !id || !products.length) return null;
  return { id, label, products };
}

function servicesOf(entry: CsServices | undefined): StoreHome["services"] {
  const label = entry?.label?.trim() || "";
  const id = entry?.anchor?.trim() || "";
  const stories = (entry?.stories ?? []).flatMap((story) => {
    const title = story.title?.trim() || "";
    const text = story.text?.trim() || "";
    const image = textValue(story.image);
    const href = textValue(story.url);
    if (!title || !text || !image || !href) return [];
    return [{ title, text, image, alt: story.image_alt?.trim() || title, href }];
  });
  if (!label || !id || !stories.length) return null;
  return { id, label, stories };
}

function heritageOf(entry: CsHeritage | undefined): StoreHome["heritage"] {
  const mark = entry?.mark?.trim() || "";
  const text = entry?.text?.trim() || "";
  return mark && text ? { mark, text } : null;
}

function offerOf(entry: CsOffer | undefined): StoreHome["offer"] {
  const chip = entry?.chip?.trim() || "";
  const title = entry?.modal_title?.trim() || "";
  const description = entry?.description?.trim() || "";
  const body = entry?.body?.trim() || "";
  const closeLabel = entry?.close_label?.trim() || "";
  const dismissLabel = entry?.dismiss_label?.trim() || "";
  if (!chip || !title || !description || !body || !closeLabel || !dismissLabel) return null;
  return { chip, title, description, body, closeLabel, dismissLabel };
}

async function entriesOf<T>(contentType: string, scopeOrPreview?: StoreScope | string): Promise<T[]> {
  const scope = asScope(scopeOrPreview);
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
  const previewToken = process.env.CONTENTSTACK_PREVIEW_TOKEN;
  if (!apiKey || !deliveryToken) return [];
  const preview = Boolean(scope.livePreview && previewToken);
  const host = preview
    ? process.env.CONTENTSTACK_PREVIEW_HOST || "https://eu-rest-preview.contentstack.com"
    : process.env.CONTENTSTACK_CDN || "https://eu-cdn.contentstack.com";
  const url = new URL(`/v3/content_types/${contentType}/entries`, host);
  url.searchParams.set("limit", "100");
  applyScope(url, scope);
  const headers = stackHeaders(apiKey, preview ? previewToken! : deliveryToken, preview);
  let response = await fetch(url, { headers, cache: "no-store" });
  if (!response.ok && scope.locale && scope.locale !== "en-us") {
    url.searchParams.set("locale", "en-us");
    response = await fetch(url, { headers, cache: "no-store" });
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Contentstack ${response.status}: ${detail.slice(0, 180)}`);
  }
  const body = await response.json() as { entries?: T[] };
  return body.entries ?? [];
}

async function firstEntry<T>(contentType: string, scope?: StoreScope): Promise<T | undefined> {
  const entries = await entriesOf<T & { sites?: SiteRef[] }>(contentType, scope);
  return pickScoped(entries, scope?.siteUid || "") as T | undefined;
}

function cardsForSite(cards: StoreHomeCard[], byHref: Map<string, StoreSwatch[]>) {
  return cards.flatMap((card) => {
    const href = card.href.split("?")[0];
    if (href.startsWith("/product/") && !byHref.has(href)) return [];
    const swatches = byHref.get(href);
    return [swatches?.length ? { ...card, swatches } : card];
  });
}

export async function getHomePage(scopeOrPreview?: StoreScope | string): Promise<StoreHome> {
  const scope = asScope(scopeOrPreview);
  const [hero, arrivals, feature, products, services, heritage, offer, catalog] = await Promise.all([
    firstEntry<CsHero>("home_hero", scope),
    firstEntry<CsBand>("home_arrivals", scope),
    firstEntry<CsBand>("home_feature", scope),
    firstEntry<CsRow>("home_product_row", scope),
    firstEntry<CsServices>("home_services", scope),
    firstEntry<CsHeritage>("home_heritage", scope),
    firstEntry<CsOffer>("home_offer", scope),
    entriesOf<CsProduct>("product", scope),
  ]);
  const siteUid = scope.siteUid || "";
  const byHref = new Map(catalog.flatMap((entry) => {
    if (!entryMatchesSite(entry.sites, siteUid)) return [];
    const product = productOf(entry);
    return product ? [[product.href, product.swatches] as const] : [];
  }));
  const arrivalBand = arrivalsOf(arrivals);
  const productRow = rowOf(products);
  const arrivalProducts = arrivalBand ? cardsForSite(arrivalBand.products, byHref) : [];
  const rowProducts = productRow ? cardsForSite(productRow.products, byHref) : [];
  return {
    hero: heroOf(hero),
    arrivals: arrivalBand && arrivalProducts.length ? { ...arrivalBand, products: arrivalProducts } : null,
    feature: featureOf(feature),
    products: productRow && rowProducts.length ? { ...productRow, products: rowProducts } : null,
    services: servicesOf(services),
    heritage: heritageOf(heritage),
    offer: offerOf(offer),
  };
}

export type StoreProduct = {
  id: string;
  title: string;
  href: string;
  price: number;
  compareAt?: number;
  image: string;
  alt: string;
  images: { src: string; alt: string }[];
  category: string;
  swatches: StoreSwatch[];
  badge?: string;
  newest: number;
};

export type StoreCategory = {
  id: string;
  label: string;
  href?: string;
  image?: string;
  alt?: string;
};

export type StoreCatalog = {
  title: string;
  url: string;
  lede: string;
  pageSize: number;
  promoAfter: number;
  department: string;
  crumbs: { label: string; href?: string }[];
  sorts: { value: string; label: string }[];
  resultsLabel: string;
  sortLabel: string;
  promo: {
    eyebrow: string;
    title: string;
    offer: string;
    action: string;
    href: string;
    categories: string[];
  };
  about: { title: string; text: string };
  categories: StoreCategory[];
  products: StoreProduct[];
};

type CsAsset = { url?: string; uid?: string } | string | null;

type CsProduct = {
  uid?: string;
  title?: string;
  url?: string;
  price?: number;
  compare_at?: number;
  image?: CsAsset;
  image_alt?: string;
  gallery?: Array<CsAsset | { image?: CsAsset; image_alt?: string }>;
  category_key?: string;
  swatches?: string[] | string;
  colors?: { label?: string; hex?: string; color_image?: CsAsset }[];
  sites?: SiteRef[];
  badge?: string;
  rank?: number;
};

type CsCategoryBlock = {
  key?: string;
  label?: string;
  url?: string;
  image?: CsAsset;
  image_alt?: string;
};

type CsCategoryPage = {
  sites?: SiteRef[];
  title?: string;
  url?: string;
  lede?: string;
  page_size?: number;
  promo_after?: number;
  crumbs?: { label?: string; url?: string }[];
  categories?: CsCategoryBlock[];
  products?: CsProduct[];
  promo?: {
    eyebrow?: string;
    title?: string;
    offer?: string;
    action?: string;
    url?: string;
    category_keys?: string[];
  };
  about?: { title?: string; text?: string };
  sorts?: { value?: string; label?: string }[];
  results_label?: string;
  sort_label?: string;
};

function assetUrl(value: CsAsset | undefined): string {
  if (!value || typeof value === "string") return typeof value === "string" ? value : "";
  return value.url || "";
}

export function departmentLabel(url: string): string {
  if (url.includes("/women")) return "Women";
  if (url.includes("/boys")) return "Boys";
  if (url.includes("/sale")) return "Sale";
  if (url.includes("/men")) return "Men";
  return "";
}

function galleryOf(entry: CsProduct, title: string, alt: string, primary: string) {
  const images = [{ src: primary, alt }];
  for (const item of entry.gallery ?? []) {
    const file = item && typeof item === "object" && "image" in item ? item.image : item;
    const src = assetUrl(file as CsAsset);
    const itemAlt = item && typeof item === "object" && "image_alt" in item ? item.image_alt : "";
    if (!src || images.some((image) => image.src === src)) continue;
    images.push({ src, alt: itemAlt || `${title}, image ${images.length + 1}` });
  }
  return images;
}

function swatchesOf(entry: CsProduct): StoreSwatch[] {
  const colors = (entry.colors ?? []).flatMap((color) => {
    const value = color.hex?.trim() || "";
    const label = color.label?.trim() || "";
    if (!value || !label) return [];
    const image = assetUrl(color.color_image);
    return [{ label, value, ...(image ? { image, alt: `${entry.title || label}, ${label}` } : {}) }];
  });
  if (colors.length) return colors;
  const hexes = Array.isArray(entry.swatches) ? entry.swatches : entry.swatches ? [entry.swatches] : [];
  return hexes.flatMap((value) => (typeof value === "string" && value.trim() ? [{ label: value.trim(), value: value.trim() }] : []));
}

function productOf(entry: CsProduct): StoreProduct | null {
  const image = assetUrl(entry.image);
  if (!entry.uid || !entry.title || !entry.url || !image || typeof entry.price !== "number") return null;
  const alt = entry.image_alt || entry.title;
  const swatches = swatchesOf(entry);
  return {
    id: entry.uid,
    title: entry.title,
    href: entry.url,
    price: entry.price,
    ...(typeof entry.compare_at === "number" ? { compareAt: entry.compare_at } : {}),
    image,
    alt,
    images: galleryOf(entry, entry.title, alt, image),
    category: entry.category_key || "",
    swatches,
    ...(entry.badge ? { badge: entry.badge } : {}),
    newest: entry.rank || 0,
  };
}

function catalogOf(entry: CsCategoryPage, siteUid = ""): StoreCatalog | null {
  if (!entry.title || !entry.url) return null;
  const categories = (entry.categories ?? []).flatMap((category) => {
    if (!category.key || !category.label) return [];
    const image = assetUrl(category.image);
    return [{
      id: category.key,
      label: category.label,
      ...(category.url ? { href: category.url } : {}),
      ...(image ? { image, alt: category.image_alt || category.label } : {}),
    }];
  });
  return {
    title: entry.title,
    url: entry.url.split("?")[0],
    lede: entry.lede || "",
    pageSize: entry.page_size || 12,
    promoAfter: entry.promo_after || 8,
    department: departmentLabel(entry.url),
    crumbs: (entry.crumbs ?? []).flatMap((crumb) => (crumb.label ? [{ label: crumb.label, ...(crumb.url ? { href: crumb.url } : {}) }] : [])),
    sorts: (entry.sorts ?? []).flatMap((sort) => (sort.value && sort.label ? [{ value: sort.value, label: sort.label }] : [])),
    resultsLabel: entry.results_label || "",
    sortLabel: entry.sort_label || "",
    promo: {
      eyebrow: entry.promo?.eyebrow || "",
      title: entry.promo?.title || "",
      offer: entry.promo?.offer || "",
      action: entry.promo?.action || "",
      href: entry.promo?.url || entry.url,
      categories: entry.promo?.category_keys || [],
    },
    about: {
      title: entry.about?.title || entry.title,
      text: entry.about?.text || "",
    },
    categories,
    products: (entry.products ?? []).flatMap((product) => {
      if (!entryMatchesSite(product.sites, siteUid)) return [];
      const mapped = productOf(product);
      return mapped ? [mapped] : [];
    }),
  };
}

async function delivery<T>(pathname: string, params: { include?: string[]; query?: string; locale?: string } = {}): Promise<T> {
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
  if (!apiKey || !deliveryToken) throw new Error("Contentstack is not configured");
  const host = process.env.CONTENTSTACK_CDN || "https://eu-cdn.contentstack.com";
  const url = new URL(pathname, host);
  for (const include of params.include ?? []) url.searchParams.append("include[]", include);
  if (params.query) url.searchParams.set("query", params.query);
  applyScope(url, { locale: params.locale });
  const headers = { api_key: apiKey, access_token: deliveryToken };
  let response = await fetch(url, { headers, cache: "no-store" });
  if (!response.ok && params.locale && params.locale !== "en-us") {
    url.searchParams.set("locale", "en-us");
    response = await fetch(url, { headers, cache: "no-store" });
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Contentstack ${response.status}: ${detail.slice(0, 180)}`);
  }
  return response.json() as Promise<T>;
}

export async function getCategoryPage(urlPath: string, scopeOrPreview?: StoreScope | string): Promise<StoreCatalog | null> {
  const scope = asScope(scopeOrPreview);
  const [body, productEntries] = await Promise.all([
    delivery<{ entries?: CsCategoryPage[] }>("/v3/content_types/category_page/entries", {
      include: ["products", "products.sites"],
      query: JSON.stringify({ url: urlPath }),
      locale: scope.locale,
    }),
    entriesOf<CsProduct>("product", scope),
  ]);
  const entry = pickScoped(body.entries ?? [], scope.siteUid || "");
  let catalog = catalogOf(entry ?? {}, scope.siteUid || "");
  if (catalog && !catalog.products.length && scope.locale && scope.locale !== "en-us") {
    const englishBody = await delivery<{ entries?: CsCategoryPage[] }>("/v3/content_types/category_page/entries", {
      include: ["products", "products.sites"],
      query: JSON.stringify({ url: urlPath }),
      locale: "en-us",
    });
    const english = catalogOf(pickScoped(englishBody.entries ?? [], scope.siteUid || "") ?? {}, scope.siteUid || "");
    if (english?.products.length) catalog = { ...catalog, products: english.products };
  }
  if (!catalog) return null;
  const full = new Map(productEntries.flatMap((productEntry) => {
    if (!entryMatchesSite(productEntry.sites, scope.siteUid || "")) return [];
    const product = productOf(productEntry);
    return product ? [[product.id, product] as const] : [];
  }));
  catalog.products = catalog.products.map((product) => full.get(product.id) || product);
  return catalog;
}

export type StoreSearchHit = { value: string; label: string; description: string };

export async function searchStore(term: string, scopeOrPreview?: StoreScope | string): Promise<StoreSearchHit[]> {
  const query = term.trim().toLowerCase();
  if (query.length < 2) return [];
  const scope = asScope(scopeOrPreview);
  const siteUid = scope.siteUid || "";
  const [products, categories] = await Promise.all([
    entriesOf<CsProduct>("product", scope),
    entriesOf<CsCategoryPage>("category_page", scope),
  ]);
  const hits: StoreSearchHit[] = [];
  for (const entry of products) {
    if (!entryMatchesSite(entry.sites, siteUid)) continue;
    const product = productOf(entry);
    if (!product) continue;
    if (!`${product.title} ${product.alt}`.toLowerCase().includes(query)) continue;
    hits.push({ value: product.href, label: product.title, description: product.alt });
  }
  for (const entry of categories) {
    if (!entryMatchesSite(entry.sites, siteUid) || !entry.title || !entry.url) continue;
    if (!`${entry.title} ${entry.lede || ""}`.toLowerCase().includes(query)) continue;
    hits.push({ value: entry.url.split("?")[0], label: entry.title, description: entry.lede || "" });
  }
  return hits.slice(0, 8);
}

export async function getProductPage(slug: string, scopeOrPreview?: StoreScope | string): Promise<{ product: StoreProduct; department: string; crumbs: { label: string; href?: string }[] } | null> {
  const scope = asScope(scopeOrPreview);
  const productBody = await delivery<{ entries?: CsProduct[] }>("/v3/content_types/product/entries", {
    query: JSON.stringify({ url: `/product/${slug}` }),
    locale: scope.locale,
  });
  const productEntry = (productBody.entries ?? []).find((entry) => entryMatchesSite(entry.sites, scope.siteUid || ""));
  const product = productOf(productEntry ?? {});
  if (!product) return null;

  const pagesBody = await delivery<{ entries?: CsCategoryPage[] }>("/v3/content_types/category_page/entries", {
    include: ["products", "products.sites"],
    locale: scope.locale,
  });
  const catalogs = (pagesBody.entries ?? []).flatMap((entry) => {
    const catalog = catalogOf(entry, scope.siteUid || "");
    return catalog ? [catalog] : [];
  });
  const matches = catalogs.filter((catalog) => catalog.products.some((item) => item.id === product.id));
  const listing = matches.find((catalog) => catalog.categories.some((category) => category.id === product.category)) || matches[0];
  const category = listing?.categories.find((item) => item.id === product.category && item.id !== "all");
  const home = listing?.crumbs.find((crumb) => crumb.href === "/") || { label: "Home", href: "/" };
  const crumbs = [
    home,
    ...(category ? [{ label: category.label, ...(category.href ? { href: category.href } : {}) }] : []),
    { label: product.title },
  ];
  return { product, department: listing?.department || "", crumbs };
}

type CsSite = {
  uid?: string;
  title?: string;
  key?: string;
  is_default?: boolean;
  locales?: string[] | string;
  theme?: {
    ink?: string;
    paper?: string;
    accent?: string;
    action?: string;
    action_hover?: string;
    display_font?: string;
    primary_font?: string;
    radius?: string;
  };
};

export type StoreSite = SiteThemeValue & { id: string; isDefault: boolean };

function siteOf(entry: CsSite, locale: string): StoreSite {
  const theme = entry.theme ?? {};
  const locales = Array.isArray(entry.locales) ? entry.locales : entry.locales ? [entry.locales] : [];
  const resolvedLocale = locale && (locales.length === 0 || locales.includes(locale)) ? locale : locales[0] || locale;
  return {
    id: entry.uid || "",
    key: entry.key || "",
    name: entry.title || "",
    locale: resolvedLocale,
    locales,
    isDefault: Boolean(entry.is_default),
    ink: theme.ink || "",
    paper: theme.paper || "",
    accent: theme.accent || "",
    action: theme.action || "",
    actionHover: theme.action_hover || "",
    displayFont: theme.display_font || "",
    primaryFont: theme.primary_font || "",
    radius: theme.radius || "",
  };
}

function chooseSite(entries: StoreSite[], requested: string) {
  if (requested) {
    const match = entries.find((site) => site.id === requested || site.key === requested);
    if (match) return match;
  }
  return entries.find((site) => site.isDefault) || entries[0];
}

export async function getSites(scopeOrPreview?: StoreScope | string): Promise<StoreSite[]> {
  const scope = asScope(scopeOrPreview);
  const entries = await entriesOf<CsSite>("site", scope);
  return entries.map((entry) => siteOf(entry, scope.locale || "")).filter((site) => site.id);
}

export async function getSite(scopeOrPreview?: StoreScope | string): Promise<StoreSite> {
  const scope = asScope(scopeOrPreview);
  const blank: StoreSite = { ...emptySiteTheme, locale: scope.locale || "", id: "", isDefault: false };
  try {
    const sites = await getSites(scope);
    return chooseSite(sites, scope.site || "") || blank;
  } catch {
    return blank;
  }
}

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (values[key] == null ? "" : String(values[key])));
}

function textOf(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberOf(value: unknown) {
  return typeof value === "number" ? value : 0;
}

export type StoreChrome = {
  placeholder: string;
  searchLabel: string;
  searchTitle: string;
  storeLabel: string;
  rewardsSuffix: string;
  rewardsLine: string;
  bagName: string;
  bagOne: string;
  bagMany: string;
  signIn: string;
  createAccount: string;
  enroll: string;
  learnMore: string;
  wishlist: string;
  track: string;
  previousOffer: string;
  nextOffer: string;
  localeLabels: { code: string; label: string }[];
  offers: { label: string; links: { label: string; href: string }[] }[];
  suggestions: { value: string; label: string; description: string }[];
  notes: Record<string, string>;
};

export const emptyChrome: StoreChrome = {
  placeholder: "",
  searchLabel: "",
  searchTitle: "",
  storeLabel: "",
  rewardsSuffix: "",
  rewardsLine: "",
  bagName: "",
  bagOne: "",
  bagMany: "",
  signIn: "",
  createAccount: "",
  enroll: "",
  learnMore: "",
  wishlist: "",
  track: "",
  previousOffer: "",
  nextOffer: "",
  localeLabels: [],
  offers: [],
  suggestions: [],
  notes: {},
};

type CsChrome = {
  sites?: SiteRef[];
  search_placeholder?: string;
  search_label?: string;
  search_title?: string;
  store_label?: string;
  rewards_suffix?: string;
  rewards_line?: string;
  bag_name?: string;
  bag_one?: string;
  bag_many?: string;
  sign_in?: string;
  create_account?: string;
  enroll?: string;
  learn_more?: string;
  wishlist?: string;
  track?: string;
  previous_offer?: string;
  next_offer?: string;
  locale_labels?: { code?: string; label?: string }[];
  offers?: { label?: string; links?: { label?: string; href?: string }[] }[];
  suggestions?: { value?: string; label?: string; description?: string }[];
  notes?: { note_id?: string; text?: string }[];
};

function chromeOf(entry: CsChrome | undefined): StoreChrome {
  if (!entry) return emptyChrome;
  return {
    placeholder: textOf(entry.search_placeholder),
    searchLabel: textOf(entry.search_label),
    searchTitle: textOf(entry.search_title),
    storeLabel: textOf(entry.store_label),
    rewardsSuffix: textOf(entry.rewards_suffix),
    rewardsLine: textOf(entry.rewards_line),
    bagName: textOf(entry.bag_name),
    bagOne: textOf(entry.bag_one),
    bagMany: textOf(entry.bag_many),
    signIn: textOf(entry.sign_in),
    createAccount: textOf(entry.create_account),
    enroll: textOf(entry.enroll),
    learnMore: textOf(entry.learn_more),
    wishlist: textOf(entry.wishlist),
    track: textOf(entry.track),
    previousOffer: textOf(entry.previous_offer),
    nextOffer: textOf(entry.next_offer),
    localeLabels: (entry.locale_labels ?? []).flatMap((item) => (item.code && item.label ? [{ code: item.code, label: item.label }] : [])),
    offers: (entry.offers ?? []).flatMap((offer) => {
      const links = (offer.links ?? []).flatMap((link) => (link.label && link.href ? [{ label: link.label, href: link.href }] : []));
      return offer.label ? [{ label: offer.label, links }] : [];
    }),
    suggestions: (entry.suggestions ?? []).flatMap((item) => (item.value && item.label ? [{ value: item.value, label: item.label, description: textOf(item.description) }] : [])),
    notes: Object.fromEntries((entry.notes ?? []).flatMap((note) => (note.note_id ? [[note.note_id, textOf(note.text)]] : []))),
  };
}

export async function getChrome(scope?: StoreScope): Promise<StoreChrome> {
  return chromeOf(await firstEntry<CsChrome>("store_chrome", scope));
}

export type StoreCart = {
  title: string;
  bannerText: string;
  bannerPrompt: string;
  bannerAction: string;
  bannerHref: string;
  shippingFlat: number;
  freeShippingAt: number;
  cardRate: number;
  promoCode: string;
  promoOff: number;
  help: string;
  helpTitle: string;
  empty: string;
  continueShopping: string;
  continueHref: string;
  shipHeading: string;
  savedHeading: string;
  summaryLabel: string;
  rewardsTitle: string;
  rewardsNote: string;
  promoPlaceholder: string;
  apply: string;
  promoApplied: string;
  promoInvalid: string;
  emptyCode: string;
  codeSavings: string;
  subtotal: string;
  shipping: string;
  free: string;
  tax: string;
  estimatedTotal: string;
  cardNote: string;
  savingsTitle: string;
  savingsText: string;
  idmeTitle: string;
  idmeText: string;
  checkout: string;
  paypal: string;
  paypalNote: string;
  amazon: string;
  amazonNote: string;
  installment: string;
  wishlistSaved: string;
  moveToBag: string;
  edit: string;
  remove: string;
  saveForLater: string;
  moveToWishlist: string;
  shipToMe: string;
  freePickup: string;
  inStock: string;
  qty: string;
};

type CsCart = StoreCart & {
  sites?: SiteRef[];
  page_title?: string;
  banner_text?: string;
  banner_prompt?: string;
  banner_action?: string;
  banner_href?: string;
  shipping_flat?: number;
  free_shipping_at?: number;
  card_rate?: number;
  promo_code?: string;
  promo_off?: number;
  help_title?: string;
  continue_shopping?: string;
  continue_href?: string;
  ship_heading?: string;
  saved_heading?: string;
  summary_label?: string;
  rewards_title?: string;
  rewards_note?: string;
  promo_placeholder?: string;
  promo_applied?: string;
  promo_invalid?: string;
  empty_code?: string;
  code_savings?: string;
  estimated_total?: string;
  card_note?: string;
  savings_title?: string;
  savings_text?: string;
  idme_title?: string;
  idme_text?: string;
  paypal_note?: string;
  amazon_note?: string;
  wishlist_saved?: string;
  move_to_bag?: string;
  save_for_later?: string;
  move_to_wishlist?: string;
  ship_to_me?: string;
  free_pickup?: string;
  in_stock?: string;
};

function cartOf(entry: CsCart | undefined): StoreCart | null {
  if (!entry?.page_title) return null;
  return {
    title: textOf(entry.page_title),
    bannerText: textOf(entry.banner_text),
    bannerPrompt: textOf(entry.banner_prompt),
    bannerAction: textOf(entry.banner_action),
    bannerHref: textOf(entry.banner_href),
    shippingFlat: numberOf(entry.shipping_flat),
    freeShippingAt: numberOf(entry.free_shipping_at),
    cardRate: numberOf(entry.card_rate),
    promoCode: textOf(entry.promo_code),
    promoOff: numberOf(entry.promo_off),
    help: textOf(entry.help),
    helpTitle: textOf(entry.help_title),
    empty: textOf(entry.empty),
    continueShopping: textOf(entry.continue_shopping),
    continueHref: textOf(entry.continue_href),
    shipHeading: textOf(entry.ship_heading),
    savedHeading: textOf(entry.saved_heading),
    summaryLabel: textOf(entry.summary_label),
    rewardsTitle: textOf(entry.rewards_title),
    rewardsNote: textOf(entry.rewards_note),
    promoPlaceholder: textOf(entry.promo_placeholder),
    apply: textOf(entry.apply),
    promoApplied: textOf(entry.promo_applied),
    promoInvalid: textOf(entry.promo_invalid),
    emptyCode: textOf(entry.empty_code),
    codeSavings: textOf(entry.code_savings),
    subtotal: textOf(entry.subtotal),
    shipping: textOf(entry.shipping),
    free: textOf(entry.free),
    tax: textOf(entry.tax),
    estimatedTotal: textOf(entry.estimated_total),
    cardNote: textOf(entry.card_note),
    savingsTitle: textOf(entry.savings_title),
    savingsText: textOf(entry.savings_text),
    idmeTitle: textOf(entry.idme_title),
    idmeText: textOf(entry.idme_text),
    checkout: textOf(entry.checkout),
    paypal: textOf(entry.paypal),
    paypalNote: textOf(entry.paypal_note),
    amazon: textOf(entry.amazon),
    amazonNote: textOf(entry.amazon_note),
    installment: textOf(entry.installment),
    wishlistSaved: textOf(entry.wishlist_saved),
    moveToBag: textOf(entry.move_to_bag),
    edit: textOf(entry.edit),
    remove: textOf(entry.remove),
    saveForLater: textOf(entry.save_for_later),
    moveToWishlist: textOf(entry.move_to_wishlist),
    shipToMe: textOf(entry.ship_to_me),
    freePickup: textOf(entry.free_pickup),
    inStock: textOf(entry.in_stock),
    qty: textOf(entry.qty),
  };
}

export async function getCartPage(scope?: StoreScope): Promise<StoreCart | null> {
  return cartOf(await firstEntry<CsCart>("cart_page", scope));
}

export type CheckoutChoice = { id: string; label: string; detail: string; price?: number };
export type CheckoutOption = { value: string; label: string };

export type StoreCheckout = {
  steps: { label: string; href: string }[];
  payments: CheckoutChoice[];
  methods: CheckoutChoice[];
  countries: CheckoutOption[];
  regions: CheckoutOption[];
  help: string;
  installment: string;
  backToBag: string;
  signInPrompt: string;
  signIn: string;
  expressHeading: string;
  paypal: string;
  paypalNote: string;
  amazon: string;
  amazonNote: string;
  required: string;
  addressHeading: string;
  firstName: string;
  lastName: string;
  address: string;
  line2: string;
  city: string;
  regionLabel: string;
  regionPlaceholder: string;
  zip: string;
  countryLabel: string;
  methodLegend: string;
  giftHeading: string;
  giftBox: string;
  giftBoxHint: string;
  giftNote: string;
  giftMessage: string;
  giftPlaceholder: string;
  itemsHeading: string;
  summary: string;
  subtotal: string;
  shippingLabel: string;
  tax: string;
  estimatedTotal: string;
  totalLabel: string;
  continueBilling: string;
  continueReview: string;
  placeOrder: string;
  needHelp: string;
  contactHeading: string;
  email: string;
  paymentLegend: string;
  nameOnCard: string;
  cardNumber: string;
  expiration: string;
  expirationPlaceholder: string;
  securityCode: string;
  billingHeading: string;
  sameAsShipping: string;
  reviewTitle: string;
  reviewAlertTitle: string;
  reviewAlertBody: string;
  edit: string;
  shipTo: string;
  billTo: string;
  payment: string;
  addAddress: string;
  addPayment: string;
  emptyBag: string;
  inStock: string;
  qty: string;
  orderPlaced: string;
  confirmationTitle: string;
  thankYou: string;
  continueShopping: string;
  confirmedTitle: string;
  confirmedBody: string;
  noOrderTitle: string;
  noOrderBody: string;
  noOrderAside: string;
  shippingHeading: string;
  itemsWord: string;
  orderWord: string;
  receipt: string;
};

type CsCheckout = {
  sites?: SiteRef[];
  help?: string;
  steps?: { label?: string; href?: string }[];
  payments?: { method_id?: string; label?: string; detail?: string }[];
  methods?: { method_id?: string; label?: string; detail?: string; price?: number }[];
  countries?: { value?: string; label?: string }[];
  regions?: { value?: string; label?: string }[];
  installment?: string;
  back_to_bag?: string;
  sign_in_prompt?: string;
  sign_in?: string;
  express_heading?: string;
  paypal?: string;
  paypal_note?: string;
  amazon?: string;
  amazon_note?: string;
  required?: string;
  address_heading?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  line2?: string;
  city?: string;
  region_label?: string;
  region_placeholder?: string;
  zip?: string;
  country_label?: string;
  method_legend?: string;
  gift_heading?: string;
  gift_box?: string;
  gift_box_hint?: string;
  gift_note?: string;
  gift_message?: string;
  gift_placeholder?: string;
  items_heading?: string;
  summary?: string;
  subtotal?: string;
  shipping_label?: string;
  tax?: string;
  estimated_total?: string;
  total_label?: string;
  continue_billing?: string;
  continue_review?: string;
  place_order?: string;
  need_help?: string;
  contact_heading?: string;
  email?: string;
  payment_legend?: string;
  name_on_card?: string;
  card_number?: string;
  expiration?: string;
  expiration_placeholder?: string;
  security_code?: string;
  billing_heading?: string;
  same_as_shipping?: string;
  review_title?: string;
  review_alert_title?: string;
  review_alert_body?: string;
  edit?: string;
  ship_to?: string;
  bill_to?: string;
  payment?: string;
  add_address?: string;
  add_payment?: string;
  empty_bag?: string;
  in_stock?: string;
  qty?: string;
  order_placed?: string;
  confirmation_title?: string;
  thank_you?: string;
  continue_shopping?: string;
  confirmed_title?: string;
  confirmed_body?: string;
  no_order_title?: string;
  no_order_body?: string;
  no_order_aside?: string;
  shipping_heading?: string;
  items_word?: string;
  order_word?: string;
  receipt?: string;
};

function checkoutOf(entry: CsCheckout | undefined): StoreCheckout | null {
  if (!entry?.steps?.length || !entry.methods?.length) return null;
  const choice = (item: { method_id?: string; label?: string; detail?: string; price?: number }): CheckoutChoice | null => (
    item.method_id && item.label ? { id: item.method_id, label: item.label, detail: textOf(item.detail), ...(typeof item.price === "number" ? { price: item.price } : {}) } : null
  );
  return {
    steps: (entry.steps ?? []).flatMap((step) => (step.label ? [{ label: step.label, href: textOf(step.href) }] : [])),
    payments: (entry.payments ?? []).flatMap((item) => { const mapped = choice(item); return mapped ? [mapped] : []; }),
    methods: (entry.methods ?? []).flatMap((item) => { const mapped = choice(item); return mapped ? [mapped] : []; }),
    countries: (entry.countries ?? []).flatMap((item) => (item.value && item.label ? [{ value: item.value, label: item.label }] : [])),
    regions: (entry.regions ?? []).flatMap((item) => (item.value && item.label ? [{ value: item.value, label: item.label }] : [])),
    help: textOf(entry.help),
    installment: textOf(entry.installment),
    backToBag: textOf(entry.back_to_bag),
    signInPrompt: textOf(entry.sign_in_prompt),
    signIn: textOf(entry.sign_in),
    expressHeading: textOf(entry.express_heading),
    paypal: textOf(entry.paypal),
    paypalNote: textOf(entry.paypal_note),
    amazon: textOf(entry.amazon),
    amazonNote: textOf(entry.amazon_note),
    required: textOf(entry.required),
    addressHeading: textOf(entry.address_heading),
    firstName: textOf(entry.first_name),
    lastName: textOf(entry.last_name),
    address: textOf(entry.address),
    line2: textOf(entry.line2),
    city: textOf(entry.city),
    regionLabel: textOf(entry.region_label),
    regionPlaceholder: textOf(entry.region_placeholder),
    zip: textOf(entry.zip),
    countryLabel: textOf(entry.country_label),
    methodLegend: textOf(entry.method_legend),
    giftHeading: textOf(entry.gift_heading),
    giftBox: textOf(entry.gift_box),
    giftBoxHint: textOf(entry.gift_box_hint),
    giftNote: textOf(entry.gift_note),
    giftMessage: textOf(entry.gift_message),
    giftPlaceholder: textOf(entry.gift_placeholder),
    itemsHeading: textOf(entry.items_heading),
    summary: textOf(entry.summary),
    subtotal: textOf(entry.subtotal),
    shippingLabel: textOf(entry.shipping_label),
    tax: textOf(entry.tax),
    estimatedTotal: textOf(entry.estimated_total),
    totalLabel: textOf(entry.total_label),
    continueBilling: textOf(entry.continue_billing),
    continueReview: textOf(entry.continue_review),
    placeOrder: textOf(entry.place_order),
    needHelp: textOf(entry.need_help),
    contactHeading: textOf(entry.contact_heading),
    email: textOf(entry.email),
    paymentLegend: textOf(entry.payment_legend),
    nameOnCard: textOf(entry.name_on_card),
    cardNumber: textOf(entry.card_number),
    expiration: textOf(entry.expiration),
    expirationPlaceholder: textOf(entry.expiration_placeholder),
    securityCode: textOf(entry.security_code),
    billingHeading: textOf(entry.billing_heading),
    sameAsShipping: textOf(entry.same_as_shipping),
    reviewTitle: textOf(entry.review_title),
    reviewAlertTitle: textOf(entry.review_alert_title),
    reviewAlertBody: textOf(entry.review_alert_body),
    edit: textOf(entry.edit),
    shipTo: textOf(entry.ship_to),
    billTo: textOf(entry.bill_to),
    payment: textOf(entry.payment),
    addAddress: textOf(entry.add_address),
    addPayment: textOf(entry.add_payment),
    emptyBag: textOf(entry.empty_bag),
    inStock: textOf(entry.in_stock),
    qty: textOf(entry.qty),
    orderPlaced: textOf(entry.order_placed),
    confirmationTitle: textOf(entry.confirmation_title),
    thankYou: textOf(entry.thank_you),
    continueShopping: textOf(entry.continue_shopping),
    confirmedTitle: textOf(entry.confirmed_title),
    confirmedBody: textOf(entry.confirmed_body),
    noOrderTitle: textOf(entry.no_order_title),
    noOrderBody: textOf(entry.no_order_body),
    noOrderAside: textOf(entry.no_order_aside),
    shippingHeading: textOf(entry.shipping_heading),
    itemsWord: textOf(entry.items_word),
    orderWord: textOf(entry.order_word),
    receipt: textOf(entry.receipt),
  };
}

export async function getCheckout(scope?: StoreScope): Promise<StoreCheckout | null> {
  return checkoutOf(await firstEntry<CsCheckout>("checkout_page", scope));
}

export function checkoutStepsFor(checkout: StoreCheckout, current: number) {
  return checkout.steps.map((step, index) => ({
    label: step.label,
    ...(index < current && step.href ? { href: step.href } : {}),
  }));
}

export type AccountCopy = {
  title: string;
  signIn: string;
  lead: string;
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
  missing: string;
  mismatch: string;
  submit: string;
  create: string;
  createLead: string;
  first: string;
  last: string;
  confirm: string;
  offers: string;
  createSubmit: string;
  newHere: string;
  have: string;
  name: string;
  account: string;
  profile: string;
  orders: string;
  nameLabel: string;
  updates: string;
  updatesOn: string;
  updatesOff: string;
  signOut: string;
  order: string;
  items: string;
  total: string;
  empty: string;
  receipt: string;
  hello: string;
  firstError: string;
  lastError: string;
  passwordRule: string;
  confirmError: string;
  taken: string;
};

type CsAccount = {
  sites?: SiteRef[];
  page_title?: string;
  sign_in_title?: string;
  sign_in_lead?: string;
  email_label?: string;
  password_label?: string;
  email_error?: string;
  password_error?: string;
  missing_account?: string;
  mismatch?: string;
  sign_in_submit?: string;
  create_title?: string;
  create_lead?: string;
  first_label?: string;
  last_label?: string;
  confirm_label?: string;
  offers_label?: string;
  create_submit?: string;
  new_here?: string;
  have_account?: string;
  name_legend?: string;
  account_legend?: string;
  profile_label?: string;
  orders_label?: string;
  name_label?: string;
  updates_label?: string;
  updates_on?: string;
  updates_off?: string;
  sign_out?: string;
  order_label?: string;
  items_label?: string;
  total_label?: string;
  empty_orders?: string;
  receipt?: string;
  hello?: string;
  first_error?: string;
  last_error?: string;
  password_rule?: string;
  confirm_error?: string;
  taken?: string;
};

function accountOf(entry: CsAccount | undefined): AccountCopy | null {
  if (!entry?.page_title) return null;
  return {
    title: textOf(entry.page_title),
    signIn: textOf(entry.sign_in_title),
    lead: textOf(entry.sign_in_lead),
    email: textOf(entry.email_label),
    password: textOf(entry.password_label),
    emailError: textOf(entry.email_error),
    passwordError: textOf(entry.password_error),
    missing: textOf(entry.missing_account),
    mismatch: textOf(entry.mismatch),
    submit: textOf(entry.sign_in_submit),
    create: textOf(entry.create_title),
    createLead: textOf(entry.create_lead),
    first: textOf(entry.first_label),
    last: textOf(entry.last_label),
    confirm: textOf(entry.confirm_label),
    offers: textOf(entry.offers_label),
    createSubmit: textOf(entry.create_submit),
    newHere: textOf(entry.new_here),
    have: textOf(entry.have_account),
    name: textOf(entry.name_legend),
    account: textOf(entry.account_legend),
    profile: textOf(entry.profile_label),
    orders: textOf(entry.orders_label),
    nameLabel: textOf(entry.name_label),
    updates: textOf(entry.updates_label),
    updatesOn: textOf(entry.updates_on),
    updatesOff: textOf(entry.updates_off),
    signOut: textOf(entry.sign_out),
    order: textOf(entry.order_label),
    items: textOf(entry.items_label),
    total: textOf(entry.total_label),
    empty: textOf(entry.empty_orders),
    receipt: textOf(entry.receipt),
    hello: textOf(entry.hello),
    firstError: textOf(entry.first_error),
    lastError: textOf(entry.last_error),
    passwordRule: textOf(entry.password_rule),
    confirmError: textOf(entry.confirm_error),
    taken: textOf(entry.taken),
  };
}

export async function getAccountPage(scope?: StoreScope): Promise<AccountCopy | null> {
  const entry = await firstEntry<CsAccount & { shoppers?: unknown; orders?: unknown }>("account_page", scope);
  if (entry) {
    delete entry.shoppers;
    delete entry.orders;
  }
  return accountOf(entry);
}
