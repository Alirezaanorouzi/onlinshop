import { isValidCategory } from "@/lib/product-gallery";
import type { CollectionSlug, Color } from "@/lib/types";

export type AdminProductBody = {
  slug: string;
  name: string;
  collection: CollectionSlug;
  category: string;
  price: number;
  description: string;
  primaryImageUrl: string;
  galleryUrls?: string[];
  colors: Color[];
  sizes: string[];
};

export function validateAdminProductBody(
  body: AdminProductBody,
  options?: { requireSlug?: boolean },
): string | null {
  if (options?.requireSlug && !body.slug?.trim()) return "slug is required";
  if (!body.name?.trim()) return "name is required";
  if (!body.collection || !body.category) {
    return "collection and category required";
  }
  if (!isValidCategory(body.collection, body.category)) {
    return "category does not belong to collection";
  }
  if (!Number.isFinite(body.price) || body.price < 0) return "invalid price";
  if (!body.primaryImageUrl?.trim()) return "primary image is required";
  if (!body.colors?.length) return "at least one color required";
  if (!body.sizes?.length) return "at least one size required";
  return null;
}
