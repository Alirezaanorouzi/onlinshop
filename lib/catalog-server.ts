import "server-only";

import { getDb } from "@/db/index";
import { isSqliteCatalog } from "@/lib/env";
import * as db from "@/lib/catalog-db";
import * as json from "@/lib/catalog-json";

let sqliteReady: boolean | null = null;

function useSqlite(): boolean {
  if (!isSqliteCatalog()) return false;
  if (sqliteReady !== null) return sqliteReady;
  try {
    getDb();
    sqliteReady = true;
  } catch {
    sqliteReady = false;
  }
  return sqliteReady;
}

export function getProducts(filter?: {
  collection?: string;
  category?: string;
  query?: string;
  slugs?: string[];
}) {
  return useSqlite() ? db.getProducts(filter) : json.getProducts(filter);
}

export function getProductBySlug(slug: string) {
  return useSqlite()
    ? db.getProductBySlug(slug)
    : json.getProductBySlug(slug);
}

/** Match DB slug when URL encoding or proxies alter the path segment. */
export function resolveProductBySlugParam(param: string) {
  const candidates = new Set<string>();
  candidates.add(param);
  try {
    candidates.add(decodeURIComponent(param));
  } catch {
    /* ignore */
  }
  try {
    candidates.add(decodeURIComponent(decodeURIComponent(param)));
  } catch {
    /* ignore */
  }

  for (const slug of candidates) {
    if (!slug) continue;
    const product = getProductBySlug(slug);
    if (product) return product;
  }
  return undefined;
}

export function getProductsBySlugs(slugs: string[]) {
  return useSqlite()
    ? db.getProductsBySlugs(slugs)
    : json.getProducts({ slugs });
}

export function getCategories(collectionSlug: string) {
  return useSqlite()
    ? db.getCategories(collectionSlug)
    : json.getCategories(collectionSlug);
}

export function getCategory(collectionSlug: string, categorySlug: string) {
  return useSqlite()
    ? db.getCategory(collectionSlug, categorySlug)
    : json.getCategory(collectionSlug, categorySlug);
}

export function listProductSlugs() {
  return useSqlite() ? db.listProductSlugs() : json.listProductSlugs();
}
