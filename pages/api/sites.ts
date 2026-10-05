import type { NextApiRequest, NextApiResponse } from "next";
import { getSites } from "../../lib/contentstack";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (_req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  const sites = await getSites().catch(() => []);
  res.status(200).json(sites);
}
