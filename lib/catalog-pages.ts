import { getCollections } from "@/lib/catalog-meta";
import { catalogUsesSqliteAtRuntime } from "@/lib/catalog-runtime";

/** @deprecated Use catalogUsesSqliteAtRuntime */
export function catalogIsDatabaseBacked(): boolean {
  return catalogUsesSqliteAtRuntime();
}

export function staticCategoryParams() {
  return getCollections().flatMap((collection) =>
    collection.categories.map((category) => ({
      slug: collection.slug,
      category: category.slug,
    })),
  );
}
