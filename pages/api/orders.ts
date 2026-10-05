import type { NextApiRequest, NextApiResponse } from "next";
import type { PlacedOrder } from "../../lib/checkoutDraft";
import { getSite } from "../../lib/contentstack";
import { ordersForShopper, saveOrder } from "../../lib/orders";
import { scopeFrom } from "../../lib/scope";

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function signedIn(req: NextApiRequest) {
  const value = cookieValue(req.headers.cookie || "", "shopper");
  if (!value.startsWith("{")) return { siteKey: "", email: "" };
  try {
    const parsed = JSON.parse(value) as { siteKey?: string; email?: string };
    return { siteKey: parsed.siteKey || "", email: parsed.email || "" };
  } catch {
    return { siteKey: "", email: "" };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const scope = scopeFrom({ req, query: req.query, resolvedUrl: req.url || "/api/orders" });
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
    const orders = await ordersForShopper();
    res.status(200).json({ orders });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "invalid" });
    return;
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {}) as PlacedOrder;
  const saved = await saveOrder(site, body);
  if (!saved) {
    res.status(400).json({ error: "invalid" });
    return;
  }
  res.status(200).json({ order: saved });
}
