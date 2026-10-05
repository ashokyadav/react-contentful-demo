import type { NextApiRequest, NextApiResponse } from "next";
import { getMegaMenu } from "../../lib/contentstack";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const livePreview = typeof req.query.live_preview === "string" ? req.query.live_preview : undefined;
  try {
    const menu = await getMegaMenu(livePreview);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(menu);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Contentstack request failed";
    res.status(502).json({ items: [], error: message });
  }
}
