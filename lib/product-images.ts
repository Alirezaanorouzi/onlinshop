import { normalizeProductGallery } from "@/lib/product-gallery";
import type { Product } from "@/lib/types";

export function getProductImages(product: Product): string[] {
  const { galleryUrls } = normalizeProductGallery(
    product.image,
    product.images,
  );
  return galleryUrls;
}
