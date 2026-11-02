import type { Metadata } from "next";
import { getBasePath } from "@/lib/base-path";
import { getPublicSiteUrl } from "@/lib/site-url";

function siteUrlFromEnv(): string | undefined {
  const fromEnv =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return fromEnv ? fromEnv.replace(/\/$/, "") : undefined;
}

/** Production should set SITE_URL so metadata/canonicals never use localhost. */
export function getMetadataBase(): URL | undefined {
  const url = siteUrlFromEnv();
  return url ? new URL(url) : undefined;
}

export function getPublicOrigin(request?: Request): string {
  const fromEnv = siteUrlFromEnv();
  if (fromEnv) return fromEnv;
  return getPublicSiteUrl(request).replace(/\/$/, "");
}

/** Absolute URL for a storefront path (respects basePath). */
export function absolutePath(path: string, request?: Request): string {
  const origin = getPublicOrigin(request);
  const base = getBasePath().replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${base}${normalized}`;
}

export function noIndexMetadata(): Pick<Metadata, "robots"> {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export function collectionCanonical(slug: string, request?: Request): string {
  return absolutePath(`/collection/${encodeURIComponent(slug)}`, request);
}

export function categoryCanonical(
  collection: string,
  category: string,
  request?: Request,
): string {
  return absolutePath(
    `/collection/${encodeURIComponent(collection)}/${encodeURIComponent(category)}`,
    request,
  );
}

export const HOME_PAGE_TITLE =
  "پوشاک قائم مقام | خرید آنلاین لباس زنانه و مردانه";
