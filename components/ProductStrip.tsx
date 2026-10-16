"use client";

import Link from "next/link";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { getProductImages } from "@/lib/product-images";
import { formatNumber, formatPrice } from "@/lib/format";
import { useSearch } from "@/lib/search";
import type { Product } from "@/lib/types";

function ProductCard({ product }: { product: Product }) {
  const images = getProductImages(product);

  return (
    <div
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/50 p-2 transition hover:border-gold/35 hover:bg-surface"
    >
      <ProductImageGallery
        images={images}
        alt={product.name}
        variant="card"
        productHref={`/product/${product.slug}`}
      />
      <Link
        href={`/product/${product.slug}`}
        className="mt-3 line-clamp-2 px-1 text-sm leading-6 hover:text-gold"
      >
        {product.name}
      </Link>
      <span className="mt-1 px-1 pb-1 text-xs text-gold">{formatPrice(product.price)}</span>
    </div>
  );
}

export function ProductStrip({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  const { query } = useSearch();
  const needle = query.trim();
  const visible = needle
    ? products.filter((product) => product.name.includes(needle))
    : products;

  return (
    <section className="mx-auto max-w-6xl px-3 pb-12 sm:px-4 sm:pb-16">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="text-sm text-muted">{title}</h2>
        <p className="text-sm text-muted">{formatNumber(visible.length)} مورد</p>
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-cream/80">محصولی با این نام پیدا نشد.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
