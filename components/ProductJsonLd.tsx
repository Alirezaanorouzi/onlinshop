import { buildProductJsonLd } from "@/lib/seo/product-jsonld";
import type { Product } from "@/lib/types";

export function ProductJsonLd({
  product,
  request,
}: {
  product: Product;
  request?: Request;
}) {
  const json = buildProductJsonLd(product, request);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
