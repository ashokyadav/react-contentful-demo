import { createContext, useContext, type ReactNode } from "react";
import { emptyChrome, type StoreChrome } from "../lib/contentstack";

const ChromeContext = createContext<StoreChrome>(emptyChrome);

export function ChromeProvider({ chrome, children }: { chrome: StoreChrome; children: ReactNode }) {
  return <ChromeContext.Provider value={chrome}>{children}</ChromeContext.Provider>;
}

export function useChrome() {
  return useContext(ChromeContext);
}
