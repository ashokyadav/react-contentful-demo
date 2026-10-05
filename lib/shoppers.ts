import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { pickScoped, type StoreSite } from "./contentstack";
import type { Shopper } from "./account";

type SiteRef = { uid?: string } | string;

type StoredShopper = {
  first_name?: string;
  last_name?: string;
  email?: string;
  password_hash?: string;
  email_offers?: boolean;
  site_key?: string;
};

type AccountEntry = {
  uid?: string;
  title?: string;
  sites?: SiteRef[];
  shoppers?: StoredShopper[];
};

const skip = new Set(["uid", "created_at", "updated_at", "created_by", "updated_by", "ACL", "publish_details", "locale", "_version", "_in_progress", "tags"]);

export type ShopperFailure = "taken" | "missing" | "mismatch" | "invalid";

export type ShopperResult = { ok: true; shopper: Shopper } | { ok: false; error: ShopperFailure };

function managementHeaders() {
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const token = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
  if (!apiKey || !token) throw new Error("Contentstack management is not configured");
  return { api_key: apiKey, authorization: token, "Content-Type": "application/json" };
}

async function management<T>(pathname: string, options: { method?: string; body?: string } = {}): Promise<T> {
  const response = await fetch(`https://eu-api.contentstack.com${pathname}`, {
    ...options,
    headers: managementHeaders(),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof body === "object" && body ? JSON.stringify(body).slice(0, 240) : "";
    throw new Error(`Contentstack ${response.status} ${detail}`);
  }
  return body as T;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function passwordMatches(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || hash.length !== 64) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(actual, expected);
}

function publicShopper(record: StoredShopper): Shopper | null {
  if (!record.first_name || !record.last_name || !record.email) return null;
  return {
    first: record.first_name,
    last: record.last_name,
    email: record.email,
    emailOffers: Boolean(record.email_offers),
  };
}

function editable(entry: AccountEntry) {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entry)) {
    if (skip.has(key) || key.startsWith("_")) continue;
    body[key] = value;
  }
  if (Array.isArray(body.sites)) {
    const sites = (body.sites as SiteRef[]).flatMap((site) => {
      const uid = typeof site === "string" ? site : site?.uid || "";
      return uid ? [{ uid, _content_type_uid: "site" }] : [];
    });
    if (sites.length) body.sites = sites;
    else delete body.sites;
  }
  return body;
}

async function accountRecord(site: Pick<StoreSite, "id">) {
  const body = await management<{ entries?: AccountEntry[] }>("/v3/content_types/account_page/entries?locale=en-us");
  const entry = pickScoped(body.entries ?? [], site.id);
  if (!entry?.uid) throw new Error("Account page is missing");
  return entry;
}

function sameShopper(record: StoredShopper, email: string, siteKey: string) {
  return record.email?.toLowerCase() === email && record.site_key === siteKey;
}

async function saveShoppers(entry: AccountEntry, shoppers: StoredShopper[]) {
  const next = editable(entry);
  next.shoppers = shoppers;
  const saved = await management<{ entry?: AccountEntry }>(`/v3/content_types/account_page/entries/${entry.uid}`, {
    method: "PUT",
    body: JSON.stringify({ entry: next }),
  });
  const environment = process.env.CONTENTSTACK_ENVIRONMENT || "my";
  await management(`/v3/content_types/account_page/entries/${entry.uid}/publish`, {
    method: "POST",
    body: JSON.stringify({ entry: { environments: [environment], locales: ["en-us"] }, locale: "en-us" }),
  });
  return saved.entry ?? entry;
}

export async function registerShopper(
  site: Pick<StoreSite, "id" | "key">,
  input: { first: string; last: string; email: string; password: string; emailOffers: boolean },
): Promise<ShopperResult> {
  const email = input.email.trim().toLowerCase();
  const first = input.first.trim();
  const last = input.last.trim();
  if (!site.key || !first || !last || !email.includes("@") || input.password.length < 8) return { ok: false, error: "invalid" };
  const entry = await accountRecord(site);
  const shoppers = entry.shoppers ?? [];
  if (shoppers.some((record) => sameShopper(record, email, site.key))) return { ok: false, error: "taken" };
  const record: StoredShopper = {
    first_name: first,
    last_name: last,
    email,
    password_hash: hashPassword(input.password),
    email_offers: input.emailOffers,
    site_key: site.key,
  };
  await saveShoppers(entry, [...shoppers, record]);
  return { ok: true, shopper: { first, last, email, emailOffers: input.emailOffers } };
}

export async function authenticateShopper(
  site: Pick<StoreSite, "id" | "key">,
  emailInput: string,
  password: string,
): Promise<ShopperResult> {
  const email = emailInput.trim().toLowerCase();
  if (!site.key || !email.includes("@") || !password) return { ok: false, error: "invalid" };
  const entry = await accountRecord(site);
  const record = (entry.shoppers ?? []).find((item) => sameShopper(item, email, site.key));
  if (!record) return { ok: false, error: "missing" };
  if (!record.password_hash || !passwordMatches(password, record.password_hash)) return { ok: false, error: "mismatch" };
  const shopper = publicShopper(record);
  if (!shopper) return { ok: false, error: "invalid" };
  return { ok: true, shopper };
}

export async function loadShopper(site: Pick<StoreSite, "id" | "key">, emailInput: string): Promise<Shopper | null> {
  const email = emailInput.trim().toLowerCase();
  if (!site.key || !email) return null;
  const entry = await accountRecord(site);
  const record = (entry.shoppers ?? []).find((item) => sameShopper(item, email, site.key));
  return record ? publicShopper(record) : null;
}
