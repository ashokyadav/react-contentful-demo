import { createContext, useContext, type ReactNode } from "react";
import { emptyFooter, type StoreFooter } from "../lib/contentstack";

const FooterContext = createContext<StoreFooter>(emptyFooter);

export function FooterProvider({ footer, children }: { footer: StoreFooter; children: ReactNode }) {
  return <FooterContext.Provider value={footer}>{children}</FooterContext.Provider>;
}

export function useFooter() {
  return useContext(FooterContext);
}
