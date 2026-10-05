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

type ShopperResponse = { shopper?: Shopper; error?: "taken" | "missing" | "mismatch" | "invalid" };

async function send(method: string, body?: unknown): Promise<ShopperResponse & { ok: boolean }> {
  const response = await fetch("/api/account", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json().catch(() => ({}))) as ShopperResponse;
  return { ok: response.ok, ...data };
}

export async function createShopper(input: Shopper & { password: string }) {
  const result = await send("POST", { action: "create", ...input });
  if (!result.ok || !result.shopper) return { ok: false as const, error: result.error || "invalid" };
  return { ok: true as const, shopper: result.shopper };
}

export async function signIn(email: string, password: string) {
  const result = await send("POST", { action: "login", email, password });
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
