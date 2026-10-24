import Image from "next/image";
import Link from "next/link";
import { ProductShareButton } from "@/components/ProductShareButton";
import { assetPath } from "@/lib/asset-path";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Server-rendered grid card (no client gallery) — keeps header interactive while images load. */
export function ProductCard({ product }: { product: Product }) {
  return (
    <div
      data-product-strip-item
      data-product-name={product.name}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/50 p-2 transition hover:border-gold/35 hover:bg-surface"
    >
      <div className="relative overflow-hidden rounded-xl">
        <Link
          href={`/product/${product.slug}`}
          className="relative block aspect-[3/4] bg-surface transition duration-300 group-hover:scale-[1.01]"
          prefetch={false}
        >
          <Image
            src={assetPath(product.image)}
            alt={product.name}
            fill
            unoptimized
            loading="lazy"
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </Link>
        <ProductShareButton slug={product.slug} productName={product.name} />
      </div>
      <Link
        href={`/product/${product.slug}`}
        prefetch={false}
        className="mt-3 line-clamp-2 px-1 text-sm leading-6 hover:text-gold"
      >
        {product.name}
      </Link>
      <span className="mt-1 px-1 pb-1 text-xs text-gold">
        {formatPrice(product.price)}
      </span>
    </div>
  );
}
