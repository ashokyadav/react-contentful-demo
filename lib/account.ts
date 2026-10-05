import { findAccount, saveAccount } from "./browserLedger";

export type Shopper = {
  first: string;
  last: string;
  email: string;
  emailOffers: boolean;
};

const emailPattern = /^\S+@\S+\.\S+$/;

export function validEmail(value: string) {
  return emailPattern.test(value);
}

type ShopperResponse = { shopper?: Shopper; passwordHash?: string; error?: "taken" | "missing" | "mismatch" | "invalid" };

async function send(method: string, body?: unknown): Promise<ShopperResponse & { ok: boolean }> {
  const response = await fetch("/api/account", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json().catch(() => ({}))) as ShopperResponse;
  return { ok: response.ok, ...data };
}

export async function createShopper(siteKey: string, input: Shopper & { password: string }) {
  const email = input.email.trim().toLowerCase();
  if (findAccount(siteKey, email)) return { ok: false as const, error: "taken" as const };
  const result = await send("POST", { action: "create", ...input, email });
  if (!result.ok || !result.shopper || !result.passwordHash) return { ok: false as const, error: result.error || "invalid" };
  saveAccount(siteKey, result.shopper, result.passwordHash);
  return { ok: true as const, shopper: result.shopper };
}

export async function signIn(siteKey: string, email: string, password: string) {
  const saved = findAccount(siteKey, email);
  if (!saved) return { ok: false as const, error: "missing" as const };
  const result = await send("POST", {
    action: "login",
    email,
    password,
    passwordHash: saved.passwordHash,
    first: saved.shopper.first,
    last: saved.shopper.last,
    emailOffers: saved.shopper.emailOffers,
  });
  if (!result.ok || !result.shopper) return { ok: false as const, error: result.error || "invalid" };
  return { ok: true as const, shopper: result.shopper };
}

export async function currentShopper() {
  const result = await send("GET");
  return result.ok ? result.shopper ?? null : null;
}

export async function signOut() {
  await send("DELETE");
}
