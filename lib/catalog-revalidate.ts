import { revalidatePath } from "next/cache";
import { getCollections } from "@/lib/catalog-meta";

/** Refresh all shop listing pages after admin catalog changes. */
export function revalidateStorefrontCatalog(options?: {
  collection?: string;
  category?: string;
  productSlug?: string;
  previousCollection?: string;
  previousCategory?: string;
}) {
  revalidatePath("/collection/men");
  revalidatePath("/collection/women");

  const collections = new Set<string>();
  const categories: { collection: string; category: string }[] = [];

  if (options?.collection) collections.add(options.collection);
  if (options?.previousCollection) collections.add(options.previousCollection);

  for (const col of getCollections()) {
    collections.add(col.slug);
    for (const cat of col.categories) {
      categories.push({ collection: col.slug, category: cat.slug });
    }
  }

  for (const slug of collections) {
    revalidatePath(`/collection/${slug}`);
  }

  for (const { collection, category } of categories) {
    revalidatePath(`/collection/${collection}/${category}`);
  }

  if (options?.productSlug) {
    revalidatePath(`/product/${options.productSlug}`);
  }
}
