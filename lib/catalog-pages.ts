import { getCollections } from "@/lib/catalog-meta";

/**
 * On Liara, products live in SQLite (admin CRUD). `next build` intentionally reads
 * catalog.json (see isSqliteCatalog + NEXT_PHASE). Storefront pages must not serve
 * that frozen HTML when CATALOG_BACKEND=sqlite.
 */
export function catalogIsDatabaseBacked(): boolean {
  return process.env.CATALOG_BACKEND?.trim().toLowerCase() === "sqlite";
}

export function staticCategoryParams() {
  return getCollections().flatMap((collection) =>
    collection.categories.map((category) => ({
      slug: collection.slug,
      category: category.slug,
    })),
  );
}
