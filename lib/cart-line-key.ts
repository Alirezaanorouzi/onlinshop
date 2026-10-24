import type { CartLine } from "@/lib/types";

export function cartLineKey(line: Omit<CartLine, "quantity">): string {
  return `${line.productSlug}|${line.size}|${line.color}`;
}

export function parseCartLineKey(key: string): Omit<CartLine, "quantity"> | null {
  const parts = key.split("|");
  if (parts.length !== 3) return null;
  const [productSlug, size, color] = parts;
  if (!productSlug || !size || !color) return null;
  return { productSlug, size, color };
}

export const CHECKOUT_LINES_STORAGE_KEY = "ghaem-magham-checkout-lines";
