import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductSpecifications({
  product,
  categoryName,
  collectionTitle,
}: {
  product: Product;
  categoryName?: string;
  collectionTitle?: string;
}) {
  const colorList = product.colors.map((c) => c.name).join("، ");
  const sizeList = product.sizes.join("، ");

  return (
    <section
      className="mt-10 rounded-xl border border-white/10 bg-surface/40 p-5"
      aria-labelledby="product-specs-heading"
    >
      <h2 id="product-specs-heading" className="text-base font-medium text-cream">
        قیمت و مشخصات
      </h2>
      <dl className="mt-4 divide-y divide-white/10 text-sm">
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-muted">قیمت</dt>
          <dd className="font-medium text-gold">{formatPrice(product.price)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-muted">کد محصول</dt>
          <dd className="text-left" dir="ltr">{product.slug}</dd>
        </div>
        {collectionTitle && (
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-muted">کالکشن</dt>
            <dd>{collectionTitle}</dd>
          </div>
        )}
        {categoryName && (
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-muted">دسته</dt>
            <dd>{categoryName}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-muted">رنگ‌های موجود</dt>
          <dd>{colorList || "—"}</dd>
        </div>
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-muted">سایزهای موجود</dt>
          <dd>{sizeList || "—"}</dd>
        </div>
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-muted">واحد پول</dt>
          <dd>تومان (IRR)</dd>
        </div>
      </dl>
    </section>
  );
}
