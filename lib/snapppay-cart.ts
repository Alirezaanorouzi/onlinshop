import "server-only";

import { collections } from "@/lib/catalog-meta";
import { getProductsBySlugs } from "@/lib/catalog-server";
import type { SnappPayCartListEntry } from "@/lib/snapppay";
import { tomansToRials } from "@/lib/snapppay";
import type { CartLine, Product } from "@/lib/types";

function categoryLabel(product: Product): string {
  const collection = collections.find((c) => c.slug === product.collection);
  const category = collection?.categories.find(
    (c) => c.slug === product.category,
  );
  return category?.name ?? product.category;
}

/** Stable positive id for SnappPay cart line items. */
export function snappPayProductId(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % 2_147_483_647 || 1;
}

export function buildSnappPayCartList(input: {
  lines: CartLine[];
  cartId: number;
}): SnappPayCartListEntry {
  const slugs = [...new Set(input.lines.map((line) => line.productSlug))];
  const products = getProductsBySlugs(slugs);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const cartItems = input.lines.map((line) => {
    const product = bySlug.get(line.productSlug);
    if (!product) {
      throw new Error(`محصول نامعتبر: ${line.productSlug}`);
    }
    const unitTomans = product.price;
    return {
      id: snappPayProductId(product.slug),
      name: product.name,
      count: line.quantity,
      amount: tomansToRials(unitTomans),
      category: categoryLabel(product),
      commissionType: "TYPE1",
    };
  });

  let totalTomans = 0;
  for (const line of input.lines) {
    const product = bySlug.get(line.productSlug);
    if (!product) continue;
    totalTomans += product.price * line.quantity;
  }

  return {
    cartId: input.cartId,
    totalAmount: tomansToRials(totalTomans),
    cartItems,
    taxAmount: 0,
    shippingAmount: 0,
    isShipmentIncluded: true,
    isTaxIncluded: false,
  };
}
