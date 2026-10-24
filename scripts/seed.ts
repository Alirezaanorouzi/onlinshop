process.env.CATALOG_BACKEND = "sqlite";

import rawCatalog from "../data/catalog.json";
import { menCategoryImages } from "../lib/catalog-meta";
import { upsertProduct } from "../lib/catalog-db";
import { getDb } from "../db/index";
import { categoryImages } from "../db/schema";
import { runMigrations } from "../lib/migrate";
import type { CollectionSlug, Product } from "../lib/types";

type RawProduct = Omit<Product, "variants"> & {
  collection: CollectionSlug | "kids";
};

runMigrations();

const items = (rawCatalog as RawProduct[]).filter(
  (product) => product.collection === "men" || product.collection === "women",
);

for (const product of items) {
  upsertProduct({
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
  });
}

const db = getDb();
for (const [categorySlug, imagePath] of Object.entries(menCategoryImages)) {
  db.insert(categoryImages)
    .values({
      collection: "men",
      categorySlug,
      imageUrl: imagePath,
    })
    .onConflictDoUpdate({
      target: [categoryImages.collection, categoryImages.categorySlug],
      set: { imageUrl: imagePath },
    })
    .run();
}

console.log(`Seeded ${items.length} products into SQLite.`);
