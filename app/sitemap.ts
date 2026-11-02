import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/seo/sitemap-urls";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
