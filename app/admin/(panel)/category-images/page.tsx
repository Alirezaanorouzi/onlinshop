"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  deleteAdminCategoryImage,
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

  async function onDelete(categorySlug: string) {
    setBusySlug(categorySlug);
    setError(null);
    try {
      const updated = await deleteAdminCategoryImage(collection, categorySlug);
      setRows(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف ناموفق");
    } finally {
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
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <label
                  className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-sm text-cream transition hover:border-gold/40 ${
                    busySlug === row.categorySlug
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  {busySlug === row.categorySlug ? "در حال آپلود…" : "تغییر عکس"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={busySlug === row.categorySlug}
                    onChange={(event) => {
                      const picked = event.target.files?.[0];
                      void onPickFile(row.categorySlug, picked);
                      event.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  disabled={
                    busySlug === row.categorySlug || !row.hasOverride
                  }
                  onClick={() => void onDelete(row.categorySlug)}
                  className="flex flex-1 items-center justify-center rounded-lg border border-red-500/35 px-3 py-2 text-sm text-red-200 transition hover:border-red-400/55 disabled:cursor-not-allowed disabled:opacity-40"
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
