import type { Product } from "@/lib/types";

export function getProductImages(product: Product): string[] {
  const extra = product.images?.filter(Boolean);
  if (extra && extra.length > 0) return extra;
  return [product.image];
}
