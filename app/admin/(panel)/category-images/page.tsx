"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  listAdminCategoryImages,
  uploadAdminCategoryImage,
  type AdminCategoryImage,
} from "@/lib/admin-api";
import { assetPath } from "@/lib/asset-path";
import { getCollections } from "@/lib/catalog";
import { prepareImageForUpload } from "@/lib/prepare-image-upload";
import type { CollectionSlug } from "@/lib/types";

const collections = getCollections();

function previewSrc(imageUrl: string) {
  if (imageUrl.startsWith("blob:")) return imageUrl;
  return assetPath(imageUrl);
}

export default function AdminCategoryImagesPage() {
  const [collection, setCollection] = useState<CollectionSlug>("men");
  const [rows, setRows] = useState<AdminCategoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listAdminCategoryImages(collection));
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری ناموفق");
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    void load();
  }, [load]);

  function patchRow(categorySlug: string, patch: Partial<AdminCategoryImage>) {
    setRows((prev) =>
      prev.map((row) =>
        row.categorySlug === categorySlug ? { ...row, ...patch } : row,
      ),
    );
  }

  async function onPickFile(categorySlug: string, file: File | undefined) {
    if (!file) return;
    setBusySlug(categorySlug);
    setError(null);

    let previewUrl: string | null = null;
    try {
      const prepared = await prepareImageForUpload(file);
      previewUrl = URL.createObjectURL(prepared);
      patchRow(categorySlug, { imageUrl: previewUrl, hasOverride: true });

      const updated = await uploadAdminCategoryImage(
        collection,
        categorySlug,
        prepared,
      );
      setRows(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق");
      await load();
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setBusySlug(null);
    }
  }

  const collectionTitle =
    collections.find((c) => c.slug === collection)?.nav ?? collection;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-cream">تصاویر دسته‌ها</h1>
          <p className="mt-1 text-sm text-muted">
            دایره‌های دسته‌بندی در صفحه کالکشن آقایان و بانوان
          </p>
        </div>
        <Link href="/admin" className="text-sm text-muted hover:text-cream">
          ← محصولات
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        {collections.map((col) => (
          <button
            key={col.slug}
            type="button"
            onClick={() => setCollection(col.slug)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              collection === col.slug
                ? "border-gold/50 bg-gold/10 text-cream"
                : "border-white/15 text-muted hover:border-white/25 hover:text-cream"
            }`}
          >
            {col.nav}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-muted">{collectionTitle}</p>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">در حال بارگذاری…</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <li
              key={row.categorySlug}
              className="rounded-xl border border-white/10 bg-surface/40 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-white/10">
                  {row.imageUrl ? (
                    <Image
                      key={row.imageUrl}
                      src={previewSrc(row.imageUrl)}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-xs text-muted">
                      —
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-cream">
                    {row.name}
                  </p>
                  <p className="text-xs text-muted" dir="ltr">
                    {row.categorySlug}
                  </p>
                </div>
              </div>
              <label className="mt-4 block">
                <span className="sr-only">تصویر {row.name}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={busySlug === row.categorySlug}
                  className="block w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-gold file:px-3 file:py-2 file:text-xs file:font-medium file:text-ink disabled:opacity-50"
                  onChange={(event) => {
                    const picked = event.target.files?.[0];
                    void onPickFile(row.categorySlug, picked);
                    event.target.value = "";
                  }}
                />
              </label>
              {busySlug === row.categorySlug && (
                <p className="mt-2 text-xs text-muted">در حال آپلود…</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
