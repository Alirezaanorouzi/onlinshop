import type { MetadataRoute } from "next";
import { getCollections } from "@/lib/catalog-meta";
import {
  listCategorySlugsWithProducts,
  listProductsForSitemap,
} from "@/lib/catalog-server";
import { absolutePath } from "@/lib/seo/site";

const STATIC_PATHS = ["/", "/about", "/contact", "/terms", "/privacy"] as const;

export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absolutePath(path),
  }));

  for (const collection of getCollections()) {
    entries.push({
      url: absolutePath(`/collection/${collection.slug}`),
    });
  }

  for (const row of listCategorySlugsWithProducts()) {
    entries.push({
      url: absolutePath(
        `/collection/${row.collection}/${encodeURIComponent(row.category)}`,
      ),
      lastModified: row.maxUpdatedAt,
    });
  }

  for (const row of listProductsForSitemap()) {
    entries.push({
      url: absolutePath(`/product/${encodeURIComponent(row.slug)}`),
      lastModified: row.updatedAt,
    });
  }

  return entries;
}
