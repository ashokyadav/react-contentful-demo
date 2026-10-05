import type { NextApiRequest, NextApiResponse } from "next";
import { getSite, searchStore } from "../../lib/contentstack";
import { scopeFor, scopeFrom } from "../../lib/scope";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ results: [] });
    return;
  }
  const scope = scopeFrom({ req, query: req.query, resolvedUrl: req.url || "/api/search" });
  const site = await getSite(scope);
  const content = scopeFor(scope, site);
  const term = typeof req.query.q === "string" ? req.query.q : "";
  const results = await searchStore(term, content).catch(() => []);
  res.status(200).json({ results });
}
