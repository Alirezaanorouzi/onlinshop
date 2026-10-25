import "server-only";

import { isVariantInStock } from "@/lib/catalog-meta";
import { getProductsBySlugs } from "@/lib/catalog-server";
import type { CartLine } from "@/lib/types";

const MAX_LINE_QTY = 99;

export function sanitizeCartLines(lines: CartLine[]): CartLine[] | { error: string } {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { error: "سبد خرید خالی است" };
  }
  const sanitized: CartLine[] = [];
  for (const line of lines) {
    if (
      !line ||
      typeof line.productSlug !== "string" ||
      !line.productSlug.trim() ||
      typeof line.size !== "string" ||
      typeof line.color !== "string"
    ) {
      return { error: "قلم سبد خرید نامعتبر است" };
    }
    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_LINE_QTY) {
      return { error: "تعداد نامعتبر است" };
    }
    sanitized.push({
      productSlug: line.productSlug.trim(),
      size: line.size.trim(),
      color: line.color.trim(),
      quantity,
    });
  }
  return sanitized;
}

export function calculateCartTotalTomans(lines: CartLine[]): {
  total: number;
  error?: string;
} {
  const parsed = sanitizeCartLines(lines);
  if ("error" in parsed) {
    return { total: 0, error: parsed.error };
  }

  const slugs = [...new Set(parsed.map((line) => line.productSlug))];
  const products = getProductsBySlugs(slugs);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  let total = 0;
  for (const line of parsed) {
    const product = bySlug.get(line.productSlug);
    if (!product) {
      return { total: 0, error: `محصول نامعتبر: ${line.productSlug}` };
    }
    if (!isVariantInStock(product, line.size, line.color)) {
      return { total: 0, error: `موجودی کافی نیست: ${product.name}` };
    }
    total += product.price * line.quantity;
  }

  return { total };
}
