"use client";

import { useMemo, useState } from "react";
import { isVariantInStock } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [color, setColor] = useState(product.colors[0]?.id ?? "");
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inStock = isVariantInStock(product, size, color);
  const colorName = useMemo(
    () => product.colors.find((item) => item.id === color)?.name,
    [product.colors, color],
  );

  function chooseColor(nextColor: string) {
    setColor(nextColor);
    setAdded(false);
    if (!isVariantInStock(product, size, nextColor)) {
      const available = product.sizes.find((item) =>
        isVariantInStock(product, item, nextColor),
      );
      if (available) setSize(available);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <p className="text-lg text-gold">{formatPrice(product.price)}</p>
      <div>
        <p className="mb-3 text-sm text-muted">رنگ{colorName ? `: ${colorName}` : ""}</p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.name}
              aria-pressed={item.id === color}
              onClick={() => chooseColor(item.id)}
              className={`size-8 rounded-full ring-offset-2 ring-offset-ink ${
                item.id === color ? "ring-2 ring-gold" : "ring-1 ring-white/20"
              }`}
              style={{ backgroundColor: item.hex }}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm text-muted">سایز</p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((item) => {
            const available = isVariantInStock(product, item, color);
            const selected = item === size;
            return (
              <button
                key={item}
                type="button"
                disabled={!available}
                onClick={() => {
                  setSize(item);
                  setAdded(false);
                }}
                className={`min-w-12 border px-3 py-2 text-sm ${
                  selected
                    ? "border-gold text-cream"
                    : "border-white/15 text-cream/80"
                } disabled:cursor-not-allowed disabled:opacity-30`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid size-9 place-items-center border border-white/15"
          aria-label="کم کردن"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
        >
          −
        </button>
        <span className="w-6 text-center text-sm">{formatNumber(quantity)}</span>
        <button
          type="button"
          className="grid size-9 place-items-center border border-white/15"
          aria-label="زیاد کردن"
          onClick={() => setQuantity((value) => Math.min(5, value + 1))}
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={!inStock}
        className="w-full bg-gold px-6 py-3 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        onClick={() => {
          addItem({ productSlug: product.slug, size, color }, quantity);
          setAdded(true);
        }}
      >
        {inStock ? "افزودن به سبد" : "ناموجود"}
      </button>
      {added && (
        <p className="text-sm text-gold">به سبد خرید اضافه شد.</p>
      )}
    </div>
  );
}
