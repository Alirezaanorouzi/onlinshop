import {
  CHECKOUT_LINES_STORAGE_KEY,
  cartLineKey,
} from "@/lib/cart-line-key";
import type { CartLine } from "@/lib/types";

/** Drop pruned lines from checkout session selection. */
export function removeFromCheckoutSelection(
  removed: Omit<CartLine, "quantity">[],
) {
  if (typeof window === "undefined" || removed.length === 0) return;
  const raw = sessionStorage.getItem(CHECKOUT_LINES_STORAGE_KEY);
  if (!raw) return;
  try {
    const keys = JSON.parse(raw) as string[];
    const drop = new Set(removed.map((line) => cartLineKey(line)));
    const next = keys.filter((key) => !drop.has(key));
    if (next.length === 0) {
      sessionStorage.removeItem(CHECKOUT_LINES_STORAGE_KEY);
    } else {
      sessionStorage.setItem(CHECKOUT_LINES_STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    sessionStorage.removeItem(CHECKOUT_LINES_STORAGE_KEY);
  }
}
