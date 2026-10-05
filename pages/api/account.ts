import type { NextApiRequest, NextApiResponse } from "next";
import { getSite } from "../../lib/contentstack";
import { scopeFrom } from "../../lib/scope";
import { authenticateShopper, loadShopper, registerShopper } from "../../lib/shoppers";

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function signedIn(req: NextApiRequest) {
  const value = cookieValue(req.headers.cookie || "", "shopper");
  const split = value.indexOf("\t");
  if (split <= 0) return { siteKey: "", email: "" };
  return { siteKey: value.slice(0, split), email: value.slice(split + 1) };
}

function setSignedIn(res: NextApiResponse, siteKey: string, email: string) {
  const value = encodeURIComponent(`${siteKey}\t${email}`);
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
    if (!session.email || session.siteKey !== site.key) {
      res.status(401).json({ error: "missing" });
      return;
    }
    const shopper = await loadShopper(site, session.email);
    if (!shopper) {
      clearSignedIn(res);
      res.status(401).json({ error: "missing" });
      return;
    }
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
    ? await authenticateShopper(site, String(body.email || ""), String(body.password || ""))
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
  setSignedIn(res, site.key, result.shopper.email);
  res.status(200).json({ shopper: result.shopper });
}
