"use client";

import Image from "next/image";
import Link from "next/link";
import { AdminNewProductLink } from "@/components/admin/AdminNewProductLink";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listAdminProducts,
  removeProduct,
} from "@/lib/admin-api";
import { getCollections } from "@/lib/catalog";
import { assetPath } from "@/lib/asset-path";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

const collections = getCollections();
const ALL = "all";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [collectionFilter, setCollectionFilter] = useState<string>(ALL);
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [deleteTarget, setDeleteTarget] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const categoryOptions = useMemo(() => {
    if (collectionFilter === ALL) {
      const seen = new Map<string, string>();
      for (const col of collections) {
        for (const cat of col.categories) {
          const key = `${col.slug}/${cat.slug}`;
          seen.set(key, cat.name);
        }
      }
      return [...seen.entries()].map(([value, label]) => ({ value, label }));
    }
    const col = collections.find((c) => c.slug === collectionFilter);
    return (col?.categories ?? []).map((cat) => ({
      value: `${collectionFilter}/${cat.slug}`,
      label: cat.name,
    }));
  }, [collectionFilter]);

  const visible = useMemo(() => {
    return products.filter((product) => {
      if (collectionFilter !== ALL && product.collection !== collectionFilter) {
        return false;
      }
      if (categoryFilter !== ALL) {
        const [col, cat] = categoryFilter.split("/");
        if (product.collection !== col || product.category !== cat) {
          return false;
        }
      }
      return true;
    });
  }, [products, collectionFilter, categoryFilter]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await removeProduct(deleteTarget.slug);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف ناموفق");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="حذف محصول"
        message={
          deleteTarget
            ? `آیا می‌خواهید «${deleteTarget.name}» حذف شود؟`
            : ""
        }
        confirmLabel="بله"
        cancelLabel="خیر"
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <Link
          href="/admin/orders"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-cream transition hover:border-gold/40"
        >
          سفارشات
        </Link>
        <Link
          href="/admin/category-images"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-cream transition hover:border-gold/40"
        >
          تصاویر دسته
        </Link>
        <AdminNewProductLink />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">محصولات</span>
            <select
              value={collectionFilter}
              onChange={(event) => {
                setCollectionFilter(event.target.value);
                setCategoryFilter(ALL);
              }}
              className="w-full min-w-[10rem] rounded-lg border border-white/15 bg-surface px-3 py-2.5 text-sm text-cream outline-none focus:border-gold/40 sm:w-auto"
            >
              <option value={ALL}>همه کالکشن‌ها</option>
              {collections.map((col) => (
                <option key={col.slug} value={col.slug}>
                  {col.nav}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">دسته‌بندی</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full min-w-[12rem] rounded-lg border border-white/15 bg-surface px-3 py-2.5 text-sm text-cream outline-none focus:border-gold/40 sm:w-auto"
            >
              <option value={ALL}>همه دسته‌ها</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-sm text-muted">{visible.length} مورد</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">در حال بارگذاری…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted">محصولی در این دسته نیست.</p>
      ) : (
        <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
          {visible.map((product) => (
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
                  loading="lazy"
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
                  onClick={() =>
                    setDeleteTarget({
                      slug: product.slug,
                      name: product.name,
                    })
                  }
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
