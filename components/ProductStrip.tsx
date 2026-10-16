"use client";

import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
import { formatNumber, formatPrice } from "@/lib/format";
import { useSearch } from "@/lib/search";
import type { Product } from "@/lib/types";

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/50 p-2 transition hover:border-gold/35 hover:bg-surface"
    >
      <span className="relative block aspect-[3/4] overflow-hidden rounded-xl bg-surface">
        <Image
          src={assetPath(product.image)}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
      </span>
      <span className="mt-3 line-clamp-2 px-1 text-sm leading-6">{product.name}</span>
      <span className="mt-1 px-1 pb-1 text-xs text-gold">{formatPrice(product.price)}</span>
    </Link>
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
    <section className="mx-auto max-w-6xl px-4 pb-16">
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
