import { pickScoped, type StoreSite } from "./contentstack";
import type { CheckoutAddress, PlacedLine, PlacedOrder } from "./checkoutDraft";

type SiteRef = { uid?: string } | string;

type StoredLine = {
  line_id?: string;
  line_title?: string;
  line_href?: string;
  line_image?: string;
  line_alt?: string;
  line_price?: number;
  line_compare?: number;
  line_color?: string;
  line_qty?: number;
};

type StoredOrder = {
  order_number?: string;
  order_email?: string;
  order_site?: string;
  order_method?: string;
  order_pay?: string;
  order_card_name?: string;
  order_card_last4?: string;
  order_gift?: string;
  order_paypal?: string;
  ship_first?: string;
  ship_last?: string;
  ship_line1?: string;
  ship_line2?: string;
  ship_city?: string;
  ship_region?: string;
  ship_zip?: string;
  ship_country?: string;
  bill_first?: string;
  bill_last?: string;
  bill_line1?: string;
  bill_line2?: string;
  bill_city?: string;
  bill_region?: string;
  bill_zip?: string;
  bill_country?: string;
  order_lines?: StoredLine[];
};

type AccountEntry = {
  uid?: string;
  sites?: SiteRef[];
  orders?: StoredOrder[];
};

const skip = new Set(["uid", "created_at", "updated_at", "created_by", "updated_by", "ACL", "publish_details", "locale", "_version", "_in_progress", "tags"]);

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
    const detail = typeof body === "object" && body ? JSON.stringify(body).slice(0, 400) : "";
    throw new Error(`Contentstack ${response.status} ${detail}`);
  }
  return body as T;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function amount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : Number.NaN;
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

function addressOf(prefix: "ship" | "bill", record: StoredOrder): CheckoutAddress | undefined {
  const read = (name: string) => text(record[`${prefix}_${name}` as keyof StoredOrder]);
  const address = {
    first: read("first"),
    last: read("last"),
    line1: read("line1"),
    line2: read("line2"),
    city: read("city"),
    region: read("region"),
    zip: read("zip"),
    country: read("country"),
  };
  if (!address.first || !address.line1 || !address.city) return undefined;
  return address;
}

function addressFields(prefix: "ship" | "bill", address: CheckoutAddress) {
  const fields: Record<string, string> = {
    [`${prefix}_first`]: address.first.trim(),
    [`${prefix}_last`]: address.last.trim(),
    [`${prefix}_line1`]: address.line1.trim(),
    [`${prefix}_city`]: address.city.trim(),
    [`${prefix}_region`]: address.region.trim(),
    [`${prefix}_zip`]: address.zip.trim(),
    [`${prefix}_country`]: address.country.trim(),
  };
  const line2 = address.line2.trim();
  if (line2) fields[`${prefix}_line2`] = line2;
  return fields;
}

function lineOf(record: StoredLine): PlacedLine | null {
  const price = amount(record.line_price);
  const quantity = amount(record.line_qty);
  if (!record.line_id || !record.line_title || !Number.isFinite(price) || !Number.isFinite(quantity)) return null;
  const compare = amount(record.line_compare);
  return {
    id: record.line_id,
    title: record.line_title,
    href: text(record.line_href),
    image: text(record.line_image),
    alt: text(record.line_alt) || record.line_title,
    price,
    ...(Number.isFinite(compare) ? { compareAt: compare } : {}),
    ...(text(record.line_color) ? { color: text(record.line_color) } : {}),
    quantity,
  };
}

function orderOf(record: StoredOrder): PlacedOrder | null {
  const address = addressOf("ship", record);
  const lines = (record.order_lines ?? []).flatMap((line) => {
    const placed = lineOf(line);
    return placed ? [placed] : [];
  });
  if (!record.order_number || !record.order_email || !record.order_method || !record.order_pay || !address || !lines.length) return null;
  const billing = addressOf("bill", record);
  return {
    number: record.order_number,
    lines,
    address,
    method: record.order_method,
    email: record.order_email,
    pay: record.order_pay,
    ...(text(record.order_card_name) ? { cardName: text(record.order_card_name) } : {}),
    ...(text(record.order_card_last4) ? { cardLast4: text(record.order_card_last4) } : {}),
    ...(billing ? { billing } : {}),
    ...(text(record.order_gift) ? { giftMessage: text(record.order_gift) } : {}),
    ...(text(record.order_paypal) ? { paypalOrderId: text(record.order_paypal) } : {}),
  };
}

function storedOrder(order: PlacedOrder, siteKey: string): StoredOrder | null {
  const email = order.email.trim().toLowerCase();
  const lines = order.lines.flatMap((line) => {
    if (!line.id || !line.title || !Number.isFinite(line.price) || !Number.isFinite(line.quantity)) return [];
    const stored: StoredLine = {
      line_id: line.id,
      line_title: line.title,
      line_price: line.price,
      line_qty: line.quantity,
    };
    if (line.href) stored.line_href = line.href;
    if (line.image) stored.line_image = line.image;
    if (line.alt) stored.line_alt = line.alt;
    if (typeof line.compareAt === "number") stored.line_compare = line.compareAt;
    if (line.color) stored.line_color = line.color;
    return [stored];
  });
  if (!order.number.trim() || !email.includes("@") || !order.method || !order.pay || !order.address || !lines.length) return null;
  return {
    order_number: order.number.trim(),
    order_email: email,
    order_site: siteKey,
    order_method: order.method,
    order_pay: order.pay,
    ...(order.cardName ? { order_card_name: order.cardName } : {}),
    ...(order.cardLast4 ? { order_card_last4: order.cardLast4 } : {}),
    ...(order.giftMessage ? { order_gift: order.giftMessage } : {}),
    ...(order.paypalOrderId ? { order_paypal: order.paypalOrderId } : {}),
    ...addressFields("ship", order.address),
    ...(order.billing ? addressFields("bill", order.billing) : {}),
    order_lines: lines,
  };
}

async function saveOrders(entry: AccountEntry, orders: StoredOrder[]) {
  const next = editable(entry);
  next.orders = orders;
  await management(`/v3/content_types/account_page/entries/${entry.uid}`, {
    method: "PUT",
    body: JSON.stringify({ entry: next }),
  });
  const environment = process.env.CONTENTSTACK_ENVIRONMENT || "my";
  await management(`/v3/content_types/account_page/entries/${entry.uid}/publish`, {
    method: "POST",
    body: JSON.stringify({ entry: { environments: [environment], locales: ["en-us"] }, locale: "en-us" }),
  });
}

export async function saveOrder(site: Pick<StoreSite, "id" | "key">, order: PlacedOrder): Promise<PlacedOrder | null> {
  if (!site.key) return null;
  const stored = storedOrder(order, site.key);
  if (!stored) return null;
  const entry = await accountRecord(site);
  const orders = entry.orders ?? [];
  if (orders.some((item) => item.order_number === stored.order_number && item.order_site === site.key)) return orderOf(stored);
  await saveOrders(entry, [...orders, stored]);
  return orderOf(stored);
}

export async function ordersForShopper(site: Pick<StoreSite, "id" | "key">, emailInput: string): Promise<PlacedOrder[]> {
  const email = emailInput.trim().toLowerCase();
  if (!site.key || !email) return [];
  const entry = await accountRecord(site);
  return (entry.orders ?? []).flatMap((record) => {
    if (record.order_email !== email || record.order_site !== site.key) return [];
    const order = orderOf(record);
    return order ? [order] : [];
  }).reverse();
}
