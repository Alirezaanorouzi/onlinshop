import type { CollectionSlug, Product } from "@/lib/types";
import type { ProductInput } from "@/lib/admin-api";
import { createProductSlug } from "@/lib/slug";

export function productToInput(product: Product): ProductInput {
  return {
    slug: product.slug,
    name: product.name,
    collection: product.collection,
    category: product.category,
    price: product.price,
    description: product.description,
    primaryImageUrl: product.image,
    galleryUrls: product.images ?? [],
    colors: product.colors,
    sizes: product.sizes,
  };
}

export function emptyProductInput(
  collection: CollectionSlug = "men",
): ProductInput {
  return {
    slug: "",
    name: "",
    collection,
    category: "shirt",
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

  return {
    ...raw,
    slug,
    name,
    description: raw.description.trim(),
    primaryImageUrl: raw.primaryImageUrl.trim(),
    galleryUrls: [],
    colors,
    sizes: raw.sizes.map((size) => size.trim()).filter(Boolean),
  };
}
