import "server-only";

import { getProductBySlug } from "@/lib/catalog-server";

/** Cart stores color id; show Persian name when possible. */
export function resolveOrderColorLabel(
  productSlug: string,
  colorValue: string,
): string {
  const product = getProductBySlug(productSlug);
  if (!product) return colorValue;
  const match = product.colors.find(
    (c) => c.id === colorValue || c.name === colorValue,
  );
  return match?.name ?? colorValue;
}

export function isOrderShipped(status: string): boolean {
  return status === "shipped";
}

export function orderShipmentLabel(status: string): "ارسال شده" | "ارسال نشده" {
  return isOrderShipped(status) ? "ارسال شده" : "ارسال نشده";
}
