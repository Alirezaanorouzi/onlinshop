import { and, desc, eq, inArray, like } from "drizzle-orm";
import { categoryImages, products } from "@/db/schema";
import { getDb } from "@/db/index";
import {
  buildCategories,
  getCollection,
  menCategoryImages,
  productHasStock,
  rowToProduct,
} from "@/lib/catalog-meta";
import { normalizeProductGallery } from "@/lib/product-gallery";
import type { Product } from "@/lib/types";

function mapProductRow(row: typeof products.$inferSelect): Product {
  return {
    ...rowToProduct({
    slug: row.slug,
    name: row.name,
    collection: row.collection,
    category: row.category,
    price: row.price,
    description: row.description,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    longDescription: row.longDescription,
    updatedAt: row.updatedAt,
    primaryImageUrl: row.primaryImageUrl,
    galleryUrls: row.galleryUrls ?? [],
    colors: row.colors,
    sizes: row.sizes,
  }),
    productCode: row.id,
  };
}

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
    .map((row) => mapProductRow(row))
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

  return mapProductRow(row);
}

export function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const db = getDb();
  const rows = db
    .select()
    .from(products)
    .where(inArray(products.slug, slugs))
    .all();

  return rows.map((row) => mapProductRow(row));
}

export function getNewestProducts(limit: number): Product[] {
  const db = getDb();
  const rows = db
    .select()
    .from(products)
    .orderBy(desc(products.updatedAt))
    .limit(limit)
    .all();
  return rows.map((row) => mapProductRow(row));
}

export function getTopSellingProducts(limit: number): Product[] {
  const sqlite = getDb().$client;
  const ranked = sqlite
    .prepare(
      `SELECT oi.product_slug AS slug, SUM(oi.quantity) AS total
       FROM order_items oi
       INNER JOIN orders o ON o.id = oi.order_id
       WHERE o.status = 'paid'
       GROUP BY oi.product_slug
       ORDER BY total DESC
       LIMIT ?`,
    )
    .all(limit) as { slug: string }[];

  if (ranked.length === 0) {
    return getNewestProducts(limit);
  }

  const slugs = ranked.map((row) => row.slug);
  const bySlug = new Map(getProductsBySlugs(slugs).map((p) => [p.slug, p]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is Product => Boolean(p));
}

export type SitemapCategoryRow = {
  collection: Product["collection"];
  category: string;
  maxUpdatedAt: Date;
};

export function listCategorySlugsWithProducts(): SitemapCategoryRow[] {
  const byKey = new Map<string, SitemapCategoryRow>();
  for (const product of getProducts()) {
    if (!productHasStock(product)) continue;
    const key = `${product.collection}:${product.category}`;
    const updatedAt = product.updatedAt ?? new Date(0);
    const existing = byKey.get(key);
    if (!existing || updatedAt > existing.maxUpdatedAt) {
      byKey.set(key, {
        collection: product.collection,
        category: product.category,
        maxUpdatedAt: updatedAt,
      });
    }
  }
  return [...byKey.values()];
}

export function listProductsForSitemap(): { slug: string; updatedAt: Date }[] {
  return getProducts()
    .filter((product) => productHasStock(product))
    .map((product) => ({
      slug: product.slug,
      updatedAt: product.updatedAt ?? new Date(),
    }));
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
  seoTitle?: string;
  seoDescription?: string;
  longDescription?: string;
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
  const seoTitle = input.seoTitle?.trim() || null;
  const seoDescription = input.seoDescription?.trim() || null;
  const longDescription = input.longDescription?.trim() || null;
  db.insert(products)
    .values({
      slug: input.slug,
      name: input.name,
      collection: input.collection,
      category: input.category,
      price: input.price,
      description: input.description,
      seoTitle,
      seoDescription,
      longDescription,
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
        seoTitle,
        seoDescription,
        longDescription,
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

export type AdminCategoryImageRow = {
  categorySlug: string;
  name: string;
  imageUrl: string;
  hasOverride: boolean;
};

export function listAdminCategoryImages(
  collection: Product["collection"],
): AdminCategoryImageRow[] {
  const collectionMeta = getCollection(collection);
  if (!collectionMeta) return [];

  const db = getDb();
  const overrides = db
    .select()
    .from(categoryImages)
    .where(eq(categoryImages.collection, collection))
    .all();
  const overrideMap = new Map(
    overrides.map((row) => [row.categorySlug, row.imageUrl]),
  );

  const productRows = db
    .select({
      category: products.category,
      primaryImageUrl: products.primaryImageUrl,
    })
    .from(products)
    .where(eq(products.collection, collection))
    .all();
  const productImageByCategory = new Map<string, string>();
  for (const row of productRows) {
    if (!productImageByCategory.has(row.category)) {
      productImageByCategory.set(row.category, row.primaryImageUrl);
    }
  }

  return collectionMeta.categories.map((category) => {
    const override = overrideMap.get(category.slug);
    const defaultImage =
      collection === "men" ? menCategoryImages[category.slug] : undefined;
    return {
      categorySlug: category.slug,
      name: category.name,
      imageUrl:
        override ??
        defaultImage ??
        productImageByCategory.get(category.slug) ??
        "",
      hasOverride: Boolean(override),
    };
  });
}

export function upsertCategoryImage(
  collection: Product["collection"],
  categorySlug: string,
  imageUrl: string,
) {
  const url = imageUrl.trim();
  if (!url) throw new Error("آدرس تصویر خالی است.");

  const collectionMeta = getCollection(collection);
  if (!collectionMeta?.categories.some((c) => c.slug === categorySlug)) {
    throw new Error("دسته‌بندی نامعتبر است.");
  }

  const db = getDb();
  db.insert(categoryImages)
    .values({
      collection,
      categorySlug,
      imageUrl: url,
    })
    .onConflictDoUpdate({
      target: [categoryImages.collection, categoryImages.categorySlug],
      set: { imageUrl: url },
    })
    .run();
}

export function deleteCategoryImage(
  collection: Product["collection"],
  categorySlug: string,
) {
  const collectionMeta = getCollection(collection);
  if (!collectionMeta?.categories.some((c) => c.slug === categorySlug)) {
    throw new Error("دسته‌بندی نامعتبر است.");
  }

  const db = getDb();
  db.delete(categoryImages)
    .where(
      and(
        eq(categoryImages.collection, collection),
        eq(categoryImages.categorySlug, categorySlug),
      ),
    )
    .run();
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

  return rows.map((row) => mapProductRow(row));
}
