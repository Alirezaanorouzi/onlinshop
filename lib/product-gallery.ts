import { getCollection } from "@/lib/catalog-meta";
import type { CollectionSlug } from "@/lib/types";

/** Ordered unique gallery URLs; first is primary / listing image. */
export function normalizeProductGallery(
  primaryImageUrl: string,
  galleryUrls?: string[] | null,
): { primaryImageUrl: string; galleryUrls: string[] } {
  const primary = primaryImageUrl?.trim() ?? "";
  const raw = (galleryUrls ?? []).map((url) => url.trim()).filter(Boolean);

  const seen = new Set<string>();
  const ordered: string[] = [];
  const push = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    ordered.push(url);
  };

  push(primary);
  for (const url of raw) push(url);

  if (ordered.length === 0) {
    return { primaryImageUrl: "", galleryUrls: [] };
  }

  return { primaryImageUrl: ordered[0], galleryUrls: ordered };
}

export function categoryForCollection(
  collection: CollectionSlug,
  category: string,
): string {
  const col = getCollection(collection);
  if (!col) return category;
  if (col.categories.some((item) => item.slug === category)) {
    return category;
  }
  return col.categories[0]?.slug ?? category;
}

export function isValidCategory(
  collection: CollectionSlug,
  category: string,
): boolean {
  const col = getCollection(collection);
  if (!col) return false;
  return col.categories.some((item) => item.slug === category);
}
