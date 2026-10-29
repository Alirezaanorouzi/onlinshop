import { isVariantInStock } from "@/lib/catalog-meta";
import type { CartLine, Product } from "@/lib/types";

export type CartLineCatalogStatus =
  | "ok"
  | "missing_product"
  | "invalid_variant"
  | "out_of_stock";

export function classifyCartLine(
  line: CartLine,
  bySlug: Map<string, Product>,
): CartLineCatalogStatus {
  const product = bySlug.get(line.productSlug);
  if (!product) return "missing_product";

  const variant = product.variants.find(
    (item) => item.size === line.size && item.color === line.color,
  );
  if (!variant) return "invalid_variant";
  if (!isVariantInStock(product, line.size, line.color)) {
    return "out_of_stock";
  }
  return "ok";
}

/** Lines removed from catalog or variant no longer exists. */
export function linesToAutoRemoveFromCart(
  lines: CartLine[],
  products: Product[],
): CartLine[] {
  if (lines.length === 0) return [];
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return lines.filter((line) => {
    const status = classifyCartLine(line, bySlug);
    return status === "missing_product" || status === "invalid_variant";
  });
}

export function filterPayableCartLines(
  lines: CartLine[],
  products: Product[],
): CartLine[] {
  if (lines.length === 0) return [];
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return lines.filter((line) => classifyCartLine(line, bySlug) === "ok");
}
