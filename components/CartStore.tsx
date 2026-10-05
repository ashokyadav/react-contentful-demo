import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSite } from "./SiteContext";

export type CartLine = {
  id: string;
  title: string;
  href: string;
  image: string;
  alt: string;
  price: number;
  compareAt?: number;
  color?: string;
  quantity: number;
  delivery: "ship" | "pickup";
};

type CartItem = Omit<CartLine, "quantity" | "delivery">;

type Bag = {
  lines: CartLine[];
  saved: CartLine[];
};

type CartApi = {
  lines: CartLine[];
  saved: CartLine[];
  count: number;
  addItem: (item: CartItem, quantity: number) => number;
  updateQuantity: (key: string, quantity: number) => void;
  setDelivery: (key: string, delivery: CartLine["delivery"]) => void;
  remove: (key: string) => void;
  clear: () => void;
  saveForLater: (key: string) => void;
  moveToBag: (key: string) => void;
};

const CartContext = createContext<CartApi | null>(null);

export function cartKey(line: { id: string; color?: string }) {
  return `${line.id}:${line.color ?? ""}`;
}

function clamp(quantity: number) {
  return Math.min(10, Math.max(1, Math.round(quantity)));
}

function isLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as CartLine;
  return typeof line.id === "string"
    && typeof line.title === "string"
    && typeof line.href === "string"
    && typeof line.image === "string"
    && typeof line.alt === "string"
    && typeof line.price === "number"
    && typeof line.quantity === "number"
    && (line.delivery === "ship" || line.delivery === "pickup");
}

function readBag(storageKey: string): Bag {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { lines: [], saved: [] };
    const parsed = JSON.parse(raw) as Partial<Bag>;
    return {
      lines: Array.isArray(parsed.lines) ? parsed.lines.filter(isLine) : [],
      saved: Array.isArray(parsed.saved) ? parsed.saved.filter(isLine) : [],
    };
  } catch {
    return { lines: [], saved: [] };
  }
}

function withLine(lines: CartLine[], key: string, update: (line: CartLine) => CartLine) {
  return lines.map((line) => (cartKey(line) === key ? update(line) : line));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const site = useSite();
  const storageKey = site.id ? `bag:${site.id}` : "";
  const [bag, setBag] = useState<Bag | null>(null);

  useEffect(() => {
    if (!storageKey) return;
    setBag(readBag(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (!bag || !storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(bag));
  }, [bag]);

  const lines = bag?.lines ?? [];
  const saved = bag?.saved ?? [];
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  const update = (change: (current: Bag) => Bag) => {
    setBag((current) => change(current ?? { lines: [], saved: [] }));
  };

  const api: CartApi = {
    lines,
    saved,
    count,
    addItem: (item, quantity) => {
      const amount = clamp(quantity);
      const existing = lines.find((line) => cartKey(line) === cartKey(item));
      const next = existing ? clamp(existing.quantity + amount) : amount;
      const added = existing ? next - existing.quantity : amount;
      update((current) => {
        const match = current.lines.find((line) => cartKey(line) === cartKey(item));
        if (!match) return { ...current, lines: [...current.lines, { ...item, quantity: amount, delivery: "ship" }] };
        return { ...current, lines: withLine(current.lines, cartKey(item), (line) => ({ ...line, quantity: clamp(line.quantity + amount) })) };
      });
      return added;
    },
    updateQuantity: (key, quantity) => {
      update((current) => ({ ...current, lines: withLine(current.lines, key, (line) => ({ ...line, quantity: clamp(quantity) })) }));
    },
    setDelivery: (key, delivery) => {
      update((current) => ({ ...current, lines: withLine(current.lines, key, (line) => ({ ...line, delivery })) }));
    },
    remove: (key) => {
      update((current) => ({
        ...current,
        lines: current.lines.filter((line) => cartKey(line) !== key),
        saved: current.saved.filter((line) => cartKey(line) !== key),
      }));
    },
    clear: () => {
      update((current) => ({ ...current, lines: [] }));
    },
    saveForLater: (key) => {
      update((current) => {
        const line = current.lines.find((item) => cartKey(item) === key);
        if (!line) return current;
        const savedLines = current.saved.filter((item) => cartKey(item) !== key);
        return {
          lines: current.lines.filter((item) => cartKey(item) !== key),
          saved: [...savedLines, line],
        };
      });
    },
    moveToBag: (key) => {
      update((current) => {
        const line = current.saved.find((item) => cartKey(item) === key);
        if (!line) return current;
        const existing = current.lines.find((item) => cartKey(item) === key);
        const lines = existing
          ? withLine(current.lines, key, (item) => ({ ...item, quantity: clamp(item.quantity + line.quantity) }))
          : [...current.lines, line];
        return { lines, saved: current.saved.filter((item) => cartKey(item) !== key) };
      });
    },
  };

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
