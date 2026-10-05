import { createContext, useContext, type ReactNode } from "react";
import type { MegaMenuItem } from "@myproject/core";

const MenuContext = createContext<{ items: MegaMenuItem[]; label?: string }>({
  items: [],
});

export function MenuProvider({
  items,
  label,
  children,
}: {
  items: MegaMenuItem[];
  label?: string;
  children: ReactNode;
}) {
  return <MenuContext.Provider value={{ items, label }}>{children}</MenuContext.Provider>;
}

export function useNavigationMenu() {
  return useContext(MenuContext);
}
