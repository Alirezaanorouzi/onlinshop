import { and, eq, inArray, like } from "drizzle-orm";
import { categoryImages, products } from "@/db/schema";
import { getDb } from "@/db/index";
import {
  buildCategories,
  getCollection,
  rowToProduct,
} from "@/lib/catalog-meta";
import { normalizeProductGallery } from "@/lib/product-gallery";
import type { Product } from "@/lib/types";

export function getProducts(filter?: {
  collection?: string;
  category?: string;
  query?: string;
  slugs?: string[];
}): Product[] {
  const db = getDb();
  const rows = db.select().from(products).all();

  const query = filter?.query?.trim();
  return rows
    .map((row) =>
      rowToProduct({
        slug: row.slug,
        name: row.name,
        collection: row.collection,
        category: row.category,
        price: row.price,
        description: row.description,
        primaryImageUrl: row.primaryImageUrl,
        galleryUrls: row.galleryUrls ?? [],
        colors: row.colors,
        sizes: row.sizes,
      }),
    )
    .filter((product) => {
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
  const db = getDb();
  const row = db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .get();
  if (!row) return undefined;

  return rowToProduct({
    slug: row.slug,
    name: row.name,
    collection: row.collection,
    category: row.category,
    price: row.price,
    description: row.description,
    primaryImageUrl: row.primaryImageUrl,
    galleryUrls: row.galleryUrls ?? [],
    colors: row.colors,
    sizes: row.sizes,
  });
}

export function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const db = getDb();
  const rows = db
    .select()
    .from(products)
    .where(inArray(products.slug, slugs))
    .all();

  return rows.map((row) =>
    rowToProduct({
      slug: row.slug,
      name: row.name,
      collection: row.collection,
      category: row.category,
      price: row.price,
      description: row.description,
      primaryImageUrl: row.primaryImageUrl,
      galleryUrls: row.galleryUrls ?? [],
      colors: row.colors,
      sizes: row.sizes,
    }),
  );
}

export function getCategories(collectionSlug: string) {
  const db = getDb();
  const collection = getCollection(collectionSlug);
  if (!collection) return [];

  const rows = db
    .select()
    .from(products)
    .where(eq(products.collection, collectionSlug as "men" | "women"))
    .all();

  const byCategory = new Map<string, string>();
  for (const row of rows) {
    if (!byCategory.has(row.category)) {
      byCategory.set(row.category, row.primaryImageUrl);
    }
  }

  const overrides = db.select().from(categoryImages).all();
  const overrideMap = new Map(
    overrides.map((row) => [
      `${row.collection}:${row.categorySlug}`,
      row.imageUrl,
    ]),
  );

  return buildCategories(collectionSlug, byCategory, overrideMap);
}

export function getCategory(collectionSlug: string, categorySlug: string) {
  return getCategories(collectionSlug).find(
    (category) => category.slug === categorySlug,
  );
}

export function listProductSlugs() {
  const db = getDb();
  return db.select({ slug: products.slug }).from(products).all().map((r) => r.slug);
}

export function upsertProduct(input: {
  slug: string;
  name: string;
  collection: Product["collection"];
  category: string;
  price: number;
  description: string;
  primaryImageUrl: string;
  galleryUrls?: string[];
  colors: Product["colors"];
  sizes: string[];
}) {
  const db = getDb();
  const { primaryImageUrl, galleryUrls } = normalizeProductGallery(
    input.primaryImageUrl,
    input.galleryUrls,
  );
  db.insert(products)
    .values({
      slug: input.slug,
      name: input.name,
      collection: input.collection,
      category: input.category,
      price: input.price,
      description: input.description,
      primaryImageUrl,
      galleryUrls,
      colors: input.colors,
      sizes: input.sizes,
    })
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: input.name,
        collection: input.collection,
        category: input.category,
        price: input.price,
        description: input.description,
        primaryImageUrl,
        galleryUrls,
        colors: input.colors,
        sizes: input.sizes,
        updatedAt: new Date(),
      },
    })
    .run();
}

export function deleteProduct(slug: string) {
  const db = getDb();
  db.delete(products).where(eq(products.slug, slug)).run();
}

export function findProductsByNameQuery(collection: string | undefined, query: string) {
  const db = getDb();
  const conditions = [like(products.name, `%${query}%`)];
  if (collection) {
    conditions.push(eq(products.collection, collection as "men" | "women"));
  }
  const rows = db
    .select()
    .from(products)
    .where(and(...conditions))
    .limit(12)
    .all();

  return rows.map((row) =>
    rowToProduct({
      slug: row.slug,
      name: row.name,
      collection: row.collection,
      category: row.category,
      price: row.price,
      description: row.description,
      primaryImageUrl: row.primaryImageUrl,
      galleryUrls: row.galleryUrls ?? [],
      colors: row.colors,
      sizes: row.sizes,
    }),
  );
}
