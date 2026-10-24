import rawCatalog from "@/data/catalog.json";
import {
  buildCategories,
  getCollection,
  rowToProduct,
  variantsFor,
} from "@/lib/catalog-meta";
import type { CollectionSlug, Product } from "@/lib/types";

type RawProduct = Omit<Product, "variants" | "collection"> & {
  collection: CollectionSlug | "kids";
};

const products: Product[] = (rawCatalog as RawProduct[])
  .filter(
    (product): product is RawProduct & { collection: CollectionSlug } =>
      product.collection === "men" || product.collection === "women",
  )
  .map((product) => ({
    ...product,
    variants: variantsFor(product.sizes, product.colors),
  }));

export function getProducts(filter?: {
  collection?: string;
  category?: string;
  query?: string;
  slugs?: string[];
}) {
  const query = filter?.query?.trim();
  return products.filter((product) => {
    if (filter?.slugs?.length && !filter.slugs.includes(product.slug)) {
      return false;
    }
    if (filter?.collection && product.collection !== filter.collection) {
      return false;
    }
    if (filter?.category && product.category !== filter.category) {
      return false;
    }
    if (query && !product.name.includes(query)) return false;
    return true;
  });
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategories(collectionSlug: string) {
  const byCategory = new Map<string, string>();
  for (const product of products) {
    if (product.collection === collectionSlug && !byCategory.has(product.category)) {
      byCategory.set(product.category, product.image);
    }
  }
  return buildCategories(collectionSlug, byCategory, new Map());
}

export function getCategory(collectionSlug: string, categorySlug: string) {
  return getCategories(collectionSlug).find(
    (category) => category.slug === categorySlug,
  );
}

export function listProductSlugs() {
  return products.map((product) => product.slug);
}
