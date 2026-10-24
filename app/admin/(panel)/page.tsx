"use client";

import Image from "next/image";
import Link from "next/link";
import { AdminNewProductLink } from "@/components/admin/AdminNewProductLink";
import { useCallback, useEffect, useState } from "react";
import {
  listAdminProducts,
  removeProduct,
} from "@/lib/admin-api";
import { assetPath } from "@/lib/asset-path";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await listAdminProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری ناموفق");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(slug: string, name: string) {
    if (!window.confirm(`حذف «${name}»؟`)) return;
    try {
      await removeProduct(slug);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف ناموفق");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex justify-end">
        <AdminNewProductLink />
      </div>
      <h1 className="mb-6 text-xl font-semibold">
        محصولات ({products.length})
      </h1>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">در حال بارگذاری…</p>
      ) : (
        <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
          {products.map((product) => (
            <li
              key={product.slug}
              className="flex flex-wrap items-center gap-4 px-4 py-3"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface">
                <Image
                  src={assetPath(product.image)}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted" dir="ltr">
                  {product.slug} · {product.collection}/{product.category}
                </p>
              </div>
              <p className="text-sm text-gold">{formatPrice(product.price)}</p>
              <div className="flex gap-2 text-sm">
                <Link
                  href={`/admin/products/${product.slug}/edit`}
                  className="text-cream hover:text-gold"
                >
                  ویرایش
                </Link>
                <button
                  type="button"
                  className="text-muted hover:text-red-300"
                  onClick={() => handleDelete(product.slug, product.name)}
                >
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
