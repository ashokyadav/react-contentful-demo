import type { StoreScope, StoreSite } from "./contentstack";

type ScopeContext = {
  query?: Partial<Record<string, string | string[]>>;
  req?: { headers?: { cookie?: string }; url?: string };
  res?: { setHeader: (name: string, value: string | string[]) => void };
  pathname?: string;
  asPath?: string;
  resolvedUrl?: string;
};

function requestPath(ctx: ScopeContext) {
  const raw = ctx.resolvedUrl || ctx.asPath || ctx.pathname || "";
  return raw.split(/[?#]/)[0] || "/";
}

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

/** Site and locale from the query string, then the cookie. The bare homepage uses the default site. */
export function scopeFrom(ctx: ScopeContext): StoreScope {
  const querySite = typeof ctx.query?.site === "string" ? ctx.query.site : "";
  const queryLocale = typeof ctx.query?.locale === "string" ? ctx.query.locale : "";
  const cookie = ctx.req?.headers?.cookie || (typeof document !== "undefined" ? document.cookie : "");
  const home = requestPath(ctx) === "/" && !querySite;
  let site = home ? "" : querySite || cookieValue(cookie, "site");
  let locale = queryLocale || cookieValue(cookie, "locale");
  if (typeof window !== "undefined") {
    if (querySite) sessionStorage.setItem("site", querySite);
    else if (!site && !home) site = sessionStorage.getItem("site") || "";
    if (queryLocale) sessionStorage.setItem("locale", queryLocale);
    else if (!locale) locale = sessionStorage.getItem("locale") || "";
  }
  return { site, locale };
}

/** Attach the Contentstack site id and a locale that site actually publishes. */
export function scopeFor(scope: StoreScope, site: Pick<StoreSite, "id" | "key" | "locale" | "locales">): StoreScope {
  const supported = site.locales ?? [];
  const requested = scope.locale || "";
  const locale = requested && (supported.length === 0 || supported.includes(requested)) ? requested : site.locale;
  return {
    ...scope,
    site: site.key || site.id || scope.site,
    siteUid: site.id,
    locale: locale || site.locale,
  };
}

export function persistScope(ctx: ScopeContext, scope: StoreScope) {
  if (!ctx.res) return;
  const cookies = [
    scope.site ? `site=${encodeURIComponent(scope.site)}; Path=/; SameSite=Lax` : "",
    scope.locale ? `locale=${encodeURIComponent(scope.locale)}; Path=/; SameSite=Lax` : "",
  ].filter(Boolean);
  if (cookies.length) ctx.res.setHeader("Set-Cookie", cookies);
}
