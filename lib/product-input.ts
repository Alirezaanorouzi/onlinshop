import { getCollections } from "@/lib/catalog-meta";
import {
  categoryForCollection,
  normalizeProductGallery,
} from "@/lib/product-gallery";
import type { CollectionSlug, Product } from "@/lib/types";
import type { ProductInput } from "@/lib/admin-api";
import { createProductSlug } from "@/lib/slug";

const collections = getCollections();

export function productToInput(product: Product): ProductInput {
  const { primaryImageUrl, galleryUrls } = normalizeProductGallery(
    product.image,
    product.images,
  );
  return {
    slug: product.slug,
    name: product.name,
    collection: product.collection,
    category: product.category,
    price: product.price,
    description: product.description,
    primaryImageUrl,
    galleryUrls,
    colors: product.colors,
    sizes: product.sizes,
  };
}

export function emptyProductInput(
  collection: CollectionSlug = "men",
): ProductInput {
  const col =
    collections.find((item) => item.slug === collection) ?? collections[0];
  return {
    slug: "",
    name: "",
    collection: col.slug as CollectionSlug,
    category: col.categories[0]?.slug ?? "shirt",
    price: 0,
    description: "",
    primaryImageUrl: "",
    galleryUrls: [],
    colors: [{ id: "color-1", name: "", hex: "#888888" }],
    sizes: ["M", "L"],
  };
}

export function parseProductInput(
  raw: ProductInput,
  options?: { isNew?: boolean },
): ProductInput {
  const name = raw.name.trim();
  const collection = raw.collection;
  let slug = raw.slug.trim();
  if (!slug && options?.isNew) {
    slug = createProductSlug(name, collection);
  }

  const colors = raw.colors
    .map((color, index) => ({
      id: color.id.trim() || `color-${index + 1}`,
      name: color.name.trim(),
      hex: color.hex.trim(),
    }))
    .filter((color) => color.name);

  const { primaryImageUrl, galleryUrls } = normalizeProductGallery(
    raw.primaryImageUrl,
    raw.galleryUrls,
  );

  return {
    ...raw,
    slug,
    name,
    collection,
    category: categoryForCollection(collection, raw.category),
    description: raw.description.trim(),
    primaryImageUrl,
    galleryUrls,
    colors,
    sizes: raw.sizes.map((size) => size.trim()).filter(Boolean),
  };
}
