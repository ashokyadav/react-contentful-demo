import { createContext, useContext, type ReactNode } from "react";
import { emptySiteTheme } from "@myproject/core";
import type { StoreSite } from "../lib/contentstack";

const fallback: StoreSite = { ...emptySiteTheme, id: "", isDefault: false };
const SiteContext = createContext<StoreSite>(fallback);

export function SiteProvider({ site, children }: { site: StoreSite; children: ReactNode }) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
