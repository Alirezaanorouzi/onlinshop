import { business } from "@/lib/business";
import { assetPath } from "@/lib/asset-path";
import { getProductImages } from "@/lib/product-images";
import { productHasStock } from "@/lib/catalog-meta";
import {
  resolveLongDescription,
  resolveSeoTitle,
} from "@/lib/seo/product-meta";
import { absolutePath } from "@/lib/seo/site";
import { formatProductCode } from "@/lib/product-code";
import { tomansToRials } from "@/lib/zarinpal";
import type { Product } from "@/lib/types";

/** Variant stock is synthetic until real warehouse data exists. */
export function buildProductJsonLd(product: Product, request?: Request) {
  const origin = absolutePath("", request).replace(/\/$/, "");
  const images = getProductImages(product).map((rel) => {
    const path = assetPath(rel);
    return path.startsWith("http") ? path : `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  });

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: resolveSeoTitle(product),
    description: resolveLongDescription(product),
    sku: formatProductCode(product.productCode),
    image: images.length > 0 ? images : undefined,
    brand: {
      "@type": "Brand",
      name: business.legalName,
    },
  };

  if (productHasStock(product)) {
    data.offers = {
      "@type": "Offer",
      url: absolutePath(`/product/${encodeURIComponent(product.slug)}`, request),
      priceCurrency: "IRR",
      price: tomansToRials(product.price),
      availability: "https://schema.org/InStock",
    };
  }

  return data;
}
