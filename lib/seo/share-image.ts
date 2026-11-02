import "server-only";

import { assetPath } from "@/lib/asset-path";
import { menCategoryImages } from "@/lib/catalog-meta";
import { getNewestProducts, getProducts } from "@/lib/catalog-server";
import { absolutePath, getPublicOrigin } from "@/lib/seo/site";
import type { Product } from "@/lib/types";
import { site } from "@/lib/site";

/** Absolute HTTPS URL for crawlers (OG, JSON-LD, Twitter). */
export function toAbsoluteImageUrl(path: string, request?: Request): string {
  const resolved = assetPath(path);
  if (/^https?:\/\//i.test(resolved)) return resolved;
  const origin = getPublicOrigin(request);
  return `${origin}${resolved.startsWith("/") ? resolved : `/${resolved}`}`;
}

function envImageUrl(...keys: string[]): string | undefined {
  for (const key of keys) {
    const raw = process.env[key]?.trim();
    if (raw) return raw;
  }
  return undefined;
}

function resolveConfiguredImage(
  configured: string | undefined,
  request?: Request,
): string | undefined {
  if (!configured) return undefined;
  if (/^https?:\/\//i.test(configured)) return configured;
  if (configured.startsWith("/")) {
    return absolutePath(configured, request);
  }
  return toAbsoluteImageUrl(configured, request);
}

/** Square logo for schema.org `logo` (override with STORE_LOGO_URL). */
export function getStoreLogoUrl(request?: Request): string {
  const fromEnv = resolveConfiguredImage(
    envImageUrl("STORE_LOGO_URL", "NEXT_PUBLIC_STORE_LOGO_URL"),
    request,
  );
  if (fromEnv) return fromEnv;
  return getStoreOgImageUrl(request);
}

/** Default storefront share image (override with STORE_OG_IMAGE_URL / SITE_OG_IMAGE). */
export function getStoreOgImageUrl(request?: Request): string {
  const fromEnv = resolveConfiguredImage(
    envImageUrl(
      "STORE_OG_IMAGE_URL",
      "NEXT_PUBLIC_STORE_OG_IMAGE_URL",
      "SITE_OG_IMAGE",
    ),
    request,
  );
  if (fromEnv) return fromEnv;

  const featured =
    getProducts({ collection: "men", category: "hoodie" })[0] ??
    getNewestProducts(1)[0] ??
    getProducts()[0];
  if (featured?.image) {
    return toAbsoluteImageUrl(featured.image, request);
  }

  return toAbsoluteImageUrl(menCategoryImages.hoodie, request);
}

export function getCollectionOgImageUrl(
  collectionSlug: string,
  request?: Request,
): string {
  const withImage = getProducts({ collection: collectionSlug }).find(
    (product) => product.image,
  );
  if (withImage) {
    return toAbsoluteImageUrl(withImage.image, request);
  }
  if (collectionSlug === "men" && menCategoryImages.hoodie) {
    return toAbsoluteImageUrl(menCategoryImages.hoodie, request);
  }
  return getStoreOgImageUrl(request);
}

export function getCategoryOgImageUrl(
  collectionSlug: string,
  categorySlug: string,
  request?: Request,
): string {
  const withImage = getProducts({
    collection: collectionSlug,
    category: categorySlug,
  }).find((product) => product.image);
  if (withImage) {
    return toAbsoluteImageUrl(withImage.image, request);
  }
  return getCollectionOgImageUrl(collectionSlug, request);
}

export function getProductOgImageUrl(product: Product, request?: Request): string {
  return toAbsoluteImageUrl(product.image, request);
}

export function socialImageMetadata(
  imageUrl: string,
  alt: string,
): {
  openGraphImages: { url: string; alt: string }[];
  twitter: {
    card: "summary_large_image";
    images: string[];
  };
} {
  return {
    openGraphImages: [{ url: imageUrl, alt }],
    twitter: {
      card: "summary_large_image",
      images: [imageUrl],
    },
  };
}

export const storeOgImageAlt = `${site.name} — فروشگاه پوشاک آنلاین`;
