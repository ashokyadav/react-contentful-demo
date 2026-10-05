import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { Shopper } from "./account";

export type ShopperFailure = "taken" | "missing" | "mismatch" | "invalid";

export type ShopperResult = { ok: true; shopper: Shopper; passwordHash?: string } | { ok: false; error: ShopperFailure };

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

export async function registerShopper(
  site: { key: string },
  input: { first: string; last: string; email: string; password: string; emailOffers: boolean },
): Promise<ShopperResult> {
  const email = input.email.trim().toLowerCase();
  const first = input.first.trim();
  const last = input.last.trim();
  if (!site.key || !first || !last || !email.includes("@") || input.password.length < 8) return { ok: false, error: "invalid" };
  return {
    ok: true,
    shopper: { first, last, email, emailOffers: input.emailOffers },
    passwordHash: hashPassword(input.password),
  };
}

export async function authenticateShopper(
  site: { key: string },
  emailInput: string,
  password: string,
  passwordHash: string,
  shopper: Shopper,
): Promise<ShopperResult> {
  const email = emailInput.trim().toLowerCase();
  if (!site.key || !email.includes("@") || !password || !passwordHash) return { ok: false, error: "invalid" };
  if (shopper.email.trim().toLowerCase() !== email) return { ok: false, error: "missing" };
  if (!passwordMatches(password, passwordHash)) return { ok: false, error: "mismatch" };
  return { ok: true, shopper: { ...shopper, email } };
}
