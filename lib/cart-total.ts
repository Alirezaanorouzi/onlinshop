import "server-only";

import { getProductsBySlugs } from "@/lib/catalog-db";
import type { CartLine } from "@/lib/types";

export function calculateCartTotalTomans(lines: CartLine[]): {
  total: number;
  error?: string;
} {
  if (lines.length === 0) return { total: 0, error: "سبد خرید خالی است" };

  const slugs = [...new Set(lines.map((line) => line.productSlug))];
  const products = getProductsBySlugs(slugs);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  let total = 0;
  for (const line of lines) {
    const product = bySlug.get(line.productSlug);
    if (!product) {
      return { total: 0, error: `محصول نامعتبر: ${line.productSlug}` };
    }
    const variant = product.variants.find(
      (v) => v.size === line.size && v.color === line.color,
    );
    if (!variant?.inStock) {
      return { total: 0, error: `موجودی کافی نیست: ${product.name}` };
    }
    total += product.price * line.quantity;
  }

  return { total };
}
