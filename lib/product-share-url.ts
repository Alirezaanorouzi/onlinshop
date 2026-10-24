import { getPublicSiteUrl } from "@/lib/site-url";

/** Path only, includes optional basePath (e.g. GitHub Pages). */
export function productPagePath(slug: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
  const path = `/product/${encodeURIComponent(slug)}`;
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}

/** Absolute URL for sharing (Instagram, copy link, Open Graph). */
export function getProductShareUrl(slug: string, request?: Request): string {
  const origin = getPublicSiteUrl(request).replace(/\/$/, "");
  return `${origin}${productPagePath(slug)}`;
}
