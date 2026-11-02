import type { Product } from "@/lib/types";

export function resolveSeoTitle(product: Product): string {
  return product.seoTitle?.trim() || product.name;
}

export function resolveSeoDescription(product: Product): string {
  return product.seoDescription?.trim() || product.description;
}

export function resolveLongDescription(product: Product): string {
  return product.longDescription?.trim() || product.description;
}
