import type { Shopper } from "./account";
import type { PlacedOrder } from "./checkoutDraft";

type SavedAccount = { siteKey: string; shopper: Shopper; passwordHash: string };
type SavedOrder = PlacedOrder & { siteKey: string };

const accountsKey = "store-accounts";
const ordersKey = "store-orders";

function readJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]") as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function findAccount(siteKey: string, email: string): SavedAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return readJson<SavedAccount>(accountsKey).find((account) => account.siteKey === siteKey && account.shopper.email === normalized);
}

export function saveAccount(siteKey: string, shopper: Shopper, passwordHash: string) {
  const accounts = readJson<SavedAccount>(accountsKey).filter((account) => !(account.siteKey === siteKey && account.shopper.email === shopper.email));
  accounts.push({ siteKey, shopper, passwordHash });
  writeJson(accountsKey, accounts);
}

export function rememberOrder(siteKey: string, order: PlacedOrder) {
  const orders = readJson<SavedOrder>(ordersKey);
  if (orders.some((item) => item.siteKey === siteKey && item.number === order.number)) return;
  orders.push({ ...order, siteKey });
  writeJson(ordersKey, orders);
}

export function ordersFor(siteKey: string, email: string): PlacedOrder[] {
  const normalized = email.trim().toLowerCase();
  return readJson<SavedOrder>(ordersKey).flatMap((order) => {
    if (order.siteKey !== siteKey || order.email.trim().toLowerCase() !== normalized) return [];
    const { siteKey: _siteKey, ...placed } = order;
    return [placed];
  }).reverse();
}
