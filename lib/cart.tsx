"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "ghaem-magham-cart";
const CHANGE_EVENT = "ghaem-magham-cart-change";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored) as CartLine[];
    if (Array.isArray(parsed)) lines = parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  load();
  return lines;
}

function getServerSnapshot() {
  return EMPTY;
}

function sameLine(a: Omit<CartLine, "quantity">, b: Omit<CartLine, "quantity">) {
  return (
    a.productSlug === b.productSlug && a.size === b.size && a.color === b.color
  );
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (line: Omit<CartLine, "quantity">, quantity: number) => void;
  removeItem: (line: Omit<CartLine, "quantity">) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: current,
      count: current.reduce((sum, line) => sum + line.quantity, 0),
      addItem: (line, quantity = 1) => {
        load();
        const existing = lines.find((item) => sameLine(item, line));
        lines = existing
          ? lines.map((item) =>
              sameLine(item, line)
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...lines, { ...line, quantity }];
        emit();
      },
      setQuantity: (line, quantity) => {
        load();
        lines = lines.flatMap((item) => {
          if (!sameLine(item, line)) return [item];
          if (quantity < 1) return [];
          return [{ ...item, quantity }];
        });
        emit();
      },
      removeItem: (line) => {
        load();
        lines = lines.filter((item) => !sameLine(item, line));
        emit();
      },
    }),
    [current],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
