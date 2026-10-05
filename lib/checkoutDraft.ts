import { ordersFor, rememberOrder } from "./browserLedger";

export type CheckoutAddress = {
  first: string;
  last: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  zip: string;
  country: string;
};

export type CheckoutDraft = {
  address?: CheckoutAddress;
  method?: string;
  giftBox?: boolean;
  giftNote?: boolean;
  giftMessage?: string;
  email?: string;
  pay?: string;
  cardName?: string;
  cardLast4?: string;
  cardExp?: string;
  billingSame?: boolean;
  billing?: CheckoutAddress;
  paypalOrderId?: string;
};

const key = "checkout";

export function readCheckout(): CheckoutDraft {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || "{}") as CheckoutDraft;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeCheckout(patch: CheckoutDraft) {
  const next = { ...readCheckout(), ...patch };
  sessionStorage.setItem(key, JSON.stringify(next));
  return next;
}

export type PlacedLine = {
  id: string;
  title: string;
  href: string;
  image: string;
  alt: string;
  price: number;
  compareAt?: number;
  color?: string;
  quantity: number;
};

export type PlacedOrder = {
  number: string;
  lines: PlacedLine[];
  address: CheckoutAddress;
  method: string;
  email: string;
  pay: string;
  cardName?: string;
  cardLast4?: string;
  billing?: CheckoutAddress;
  giftMessage?: string;
  paypalOrderId?: string;
};

const orderKey = "placed-order";

export function readOrder(): PlacedOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(sessionStorage.getItem(orderKey) || "null") as PlacedOrder | null;
    if (!parsed || typeof parsed.number !== "string" || !parsed.address || !Array.isArray(parsed.lines)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeOrder(order: PlacedOrder) {
  sessionStorage.setItem(orderKey, JSON.stringify(order));
}

export async function placeOrder(siteKey: string, order: PlacedOrder) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  const data = await response.json().catch(() => ({})) as { order?: PlacedOrder };
  if (!response.ok || !data.order) return { ok: false as const };
  rememberOrder(siteKey, data.order);
  return { ok: true as const, order: data.order };
}

export async function listOrders(siteKey: string, email: string) {
  return ordersFor(siteKey, email);
}
