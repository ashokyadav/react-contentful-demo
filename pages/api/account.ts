import type { NextApiRequest, NextApiResponse } from "next";
import { getSite } from "../../lib/contentstack";
import { scopeFrom } from "../../lib/scope";
import type { Shopper } from "../../lib/account";
import { authenticateShopper, registerShopper } from "../../lib/shoppers";

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function signedIn(req: NextApiRequest): (Shopper & { siteKey: string }) | null {
  const value = cookieValue(req.headers.cookie || "", "shopper");
  if (!value.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(value) as Partial<Shopper & { siteKey: string }>;
    if (!parsed.siteKey || !parsed.email || !parsed.first || !parsed.last) return null;
    return {
      siteKey: parsed.siteKey,
      first: parsed.first,
      last: parsed.last,
      email: parsed.email,
      emailOffers: Boolean(parsed.emailOffers),
    };
  } catch {
    return null;
  }
}

function setSignedIn(res: NextApiResponse, siteKey: string, shopper: Shopper) {
  const value = encodeURIComponent(JSON.stringify({ siteKey, ...shopper }));
  res.setHeader("Set-Cookie", `shopper=${value}; Path=/; HttpOnly; SameSite=Lax`);
}

function clearSignedIn(res: NextApiResponse) {
  res.setHeader("Set-Cookie", "shopper=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  const scope = scopeFrom({ req, query: req.query, resolvedUrl: req.url || "/api/account" });
  const site = await getSite(scope);
  if (!site.id || !site.key) {
    res.status(503).json({ error: "invalid" });
    return;
  }

  if (req.method === "GET") {
    const session = signedIn(req);
    if (!session || session.siteKey !== site.key) {
      res.status(401).json({ error: "missing" });
      return;
    }
    const { siteKey: _siteKey, ...shopper } = session;
    res.status(200).json({ shopper });
    return;
  }

  if (req.method === "DELETE") {
    clearSignedIn(res);
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");
    res.status(405).json({ error: "invalid" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  const result = body.action === "login"
    ? await authenticateShopper(
      site,
      String(body.email || ""),
      String(body.password || ""),
      String(body.passwordHash || ""),
      {
        first: String(body.first || ""),
        last: String(body.last || ""),
        email: String(body.email || ""),
        emailOffers: Boolean(body.emailOffers),
      },
    )
    : await registerShopper(site, {
      first: String(body.first || ""),
      last: String(body.last || ""),
      email: String(body.email || ""),
      password: String(body.password || ""),
      emailOffers: Boolean(body.emailOffers),
    });

  if (!result.ok) {
    const status = result.error === "taken" ? 409 : result.error === "mismatch" || result.error === "missing" ? 401 : 400;
    res.status(status).json({ error: result.error });
    return;
  }
  setSignedIn(res, site.key, result.shopper);
  res.status(200).json({ shopper: result.shopper, ...(result.passwordHash ? { passwordHash: result.passwordHash } : {}) });
}
