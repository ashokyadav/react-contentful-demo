type Link = { sys: { type: string; linkType?: string; id: string } };
type Entry = { sys: { id: string; type: string }; fields?: Record<string, unknown> };
type Asset = { sys: { id: string }; fields?: { title?: string; file?: { url?: string } } };

const localeAliases: Record<string, string> = {
  "en-us": "en-US",
  "fr-fr": "fr-FR",
};

export function contentfulLocale(code?: string) {
  if (!code) return "en-US";
  if (localeAliases[code]) return localeAliases[code];
  const [language, region] = code.split("-");
  return region ? `${language.toLowerCase()}-${region.toUpperCase()}` : code;
}

function resolveAsset(id: string, assets: Map<string, Asset>) {
  const asset = assets.get(id);
  const raw = asset?.fields?.file?.url || "";
  return {
    uid: id,
    url: raw.startsWith("//") ? `https:${raw}` : raw,
    title: asset?.fields?.title || "",
  };
}

function resolveEntry(id: string, entries: Map<string, Entry>, assets: Map<string, Asset>, seen: Set<string>): Record<string, unknown> {
  if (seen.has(id)) return { uid: id };
  const found = entries.get(id);
  if (!found) return { uid: id };
  seen.add(id);
  const fields = resolveValue(found.fields || {}, entries, assets, seen) as Record<string, unknown>;
  seen.delete(id);
  return { uid: id, ...fields };
}

function resolveValue(value: unknown, entries: Map<string, Entry>, assets: Map<string, Asset>, seen: Set<string>): unknown {
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, entries, assets, seen));
  if (!value || typeof value !== "object") return value;
  const link = value as Link;
  if (link.sys?.type === "Link" && link.sys.linkType === "Entry") return resolveEntry(link.sys.id, entries, assets, seen);
  if (link.sys?.type === "Link" && link.sys.linkType === "Asset") return resolveAsset(link.sys.id, assets);
  if (link.sys?.type === "Entry") return resolveEntry(link.sys.id, entries, assets, seen);
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    out[key] = resolveValue(child, entries, assets, seen);
  }
  const continued = out.continued;
  if (continued && typeof continued === "object" && !Array.isArray(continued)) {
    const { uid: _uid, title: _title, ...rest } = continued as Record<string, unknown>;
    delete out.continued;
    return { ...rest, ...out };
  }
  return out;
}

export async function loadContentfulEntries<T>(contentType: string, scope: { locale?: string; livePreview?: string } = {}, query?: Record<string, string>): Promise<T[]> {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const deliveryToken = process.env.CONTENTFUL_DELIVERY_TOKEN;
  const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN;
  if (!space || !deliveryToken) throw new Error("Contentful is not configured");
  const preview = Boolean(scope.livePreview && previewToken);
  const host = preview ? "https://preview.contentful.com" : "https://cdn.contentful.com";
  const token = preview ? previewToken! : deliveryToken;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  const once = async (locale: string) => {
    const items: Entry[] = [];
    const includedEntries: Entry[] = [];
    const includedAssets: Asset[] = [];
    let skip = 0;
    let total = 0;
    do {
      const url = new URL(`/spaces/${space}/environments/${environment}/entries`, host);
      url.searchParams.set("content_type", contentType);
      url.searchParams.set("locale", contentfulLocale(locale));
      url.searchParams.set("include", "10");
      url.searchParams.set("limit", "1000");
      url.searchParams.set("skip", String(skip));
      for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(`fields.${key}`, value);
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Contentful ${response.status}: ${detail.slice(0, 180)}`);
      }
      const body = await response.json() as { total?: number; items?: Entry[]; includes?: { Entry?: Entry[]; Asset?: Asset[] } };
      total = body.total ?? 0;
      items.push(...(body.items ?? []));
      includedEntries.push(...(body.includes?.Entry ?? []));
      includedAssets.push(...(body.includes?.Asset ?? []));
      skip += body.items?.length ?? 0;
    } while (skip < total && skip > 0);

    const entries = new Map<string, Entry>();
    for (const entry of [...items, ...includedEntries]) entries.set(entry.sys.id, entry);
    const assets = new Map<string, Asset>();
    for (const asset of includedAssets) assets.set(asset.sys.id, asset);
    return items.map((item) => resolveEntry(item.sys.id, entries, assets, new Set()) as T);
  };

  try {
    return await once(scope.locale || "en-us");
  } catch (error) {
    if (scope.locale && scope.locale !== "en-us") return once("en-us");
    throw error;
  }
}
