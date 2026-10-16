"use client";

import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatNumber, formatPrice } from "@/lib/format";

export function CartView() {
  const { lines, setQuantity, removeItem } = useCart();
  const detailed = lines.flatMap((line) => {
    const product = getProductBySlug(line.productSlug);
    if (!product) return [];
    const color = product.colors.find((item) => item.id === line.color);
    return [{ line, product, colorName: color?.name ?? line.color }];
  });
  const total = detailed.reduce(
    (sum, item) => sum + item.product.price * item.line.quantity,
    0,
  );

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-3xl font-semibold">سبد خرید</h1>
        <p className="mt-6 text-sm text-muted">سبد خرید خالی است.</p>
        <Link
          href="/collection/men"
          className="mt-8 inline-block border border-gold px-5 py-3 text-sm text-gold"
        >
          دیدن کالکشن آقایان
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-semibold">سبد خرید</h1>
      <ul className="mt-8 divide-y divide-white/10">
        {detailed.map(({ line, product, colorName }) => (
          <li key={`${line.productSlug}-${line.size}-${line.color}`} className="flex gap-4 py-5">
            <Image
              src={product.image}
              alt=""
              width={96}
              height={96}
              unoptimized
              className="size-24 shrink-0 object-cover"
            />
            <div className="min-w-0 flex-1">
              <Link href={`/product/${product.slug}`} className="text-sm">
                {product.name}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {colorName} / {line.size}
              </p>
              <p className="mt-2 text-sm text-gold">{formatPrice(product.price)}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  className="grid size-8 place-items-center border border-white/15"
                  aria-label="کم کردن"
                  onClick={() =>
                    setQuantity(line, line.quantity - 1)
                  }
                >
                  −
                </button>
                <span className="w-5 text-center text-sm">
                  {formatNumber(line.quantity)}
                </span>
                <button
                  type="button"
                  className="grid size-8 place-items-center border border-white/15"
                  aria-label="زیاد کردن"
                  onClick={() => setQuantity(line, line.quantity + 1)}
                >
                  +
                </button>
                <button
                  type="button"
                  className="text-xs text-muted hover:text-cream"
                  onClick={() => removeItem(line)}
                >
                  حذف
                </button>
              </div>
            </div>
            <p className="text-sm">
              {formatPrice(product.price * line.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
        <span className="text-sm text-muted">جمع سبد</span>
        <span className="text-lg text-gold">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
