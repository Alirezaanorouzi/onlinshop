import { ProductCard } from "@/components/ProductCard";
import { ProductStripSearchFilter } from "@/components/ProductStripSearchFilter";
import { formatNumber } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductStrip({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-3 pb-12 sm:px-4 sm:pb-16">
      <ProductStripSearchFilter />
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="text-sm text-muted">{title}</h2>
        <p className="text-sm text-muted" data-product-strip-count>
          {formatNumber(products.length)} مورد
        </p>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-cream/80">محصولی با این نام پیدا نشد.</p>
      ) : (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          data-product-strip-grid
        >
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
