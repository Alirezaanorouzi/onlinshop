"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { uploadImage, type ProductInput } from "@/lib/admin-api";
import { getCollections } from "@/lib/catalog";
import { assetPath } from "@/lib/asset-path";
import { categoryForCollection, normalizeProductGallery } from "@/lib/product-gallery";
import { parseProductInput } from "@/lib/product-input";
import { AdminImageCropModal } from "@/components/admin/AdminImageCropModal";
import { prepareImageForUpload } from "@/lib/prepare-image-upload";
import type { Color, CollectionSlug } from "@/lib/types";

const collections = getCollections();

function imageListFromInput(input: ProductInput): string[] {
  return normalizeProductGallery(input.primaryImageUrl, input.galleryUrls)
    .galleryUrls;
}

export function ProductForm({
  initial,
  isNew,
  onSubmit,
}: {
  initial: ProductInput;
  isNew: boolean;
  onSubmit: (input: ProductInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductInput>(initial);
  const [imageUrls, setImageUrls] = useState(() => imageListFromInput(initial));
  const [sizesText, setSizesText] = useState(initial.sizes.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const categories = useMemo(() => {
    return (
      collections.find((item) => item.slug === form.collection)?.categories ??
      []
    );
  }, [form.collection]);

  function syncImagesToForm(urls: string[]) {
    const { primaryImageUrl, galleryUrls } = normalizeProductGallery(
      urls[0] ?? "",
      urls,
    );
    setImageUrls(galleryUrls);
    setForm((prev) => ({ ...prev, primaryImageUrl, galleryUrls }));
  }

  function updateColor(index: number, patch: Partial<Color>) {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === index ? { ...color, ...patch } : color,
      ),
    }));
  }

  function addColor() {
    setForm((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          id: `color-${prev.colors.length + 1}`,
          name: "",
          hex: "#888888",
        },
      ],
    }));
  }

  function removeColor(index: number) {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  }

  async function uploadGalleryImage(file: File) {
    setBusy(true);
    setError(null);
    try {
      const prepared = await prepareImageForUpload(file);
      const url = await uploadImage(prepared);
      syncImagesToForm([...imageUrls, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق");
    } finally {
      setBusy(false);
    }
  }

  function removeImage(index: number) {
    syncImagesToForm(imageUrls.filter((_, i) => i !== index));
  }

  function setPrimaryImage(index: number) {
    if (index <= 0 || index >= imageUrls.length) return;
    const next = [...imageUrls];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    syncImagesToForm(next);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const { primaryImageUrl, galleryUrls } = normalizeProductGallery(
      imageUrls[0] ?? form.primaryImageUrl,
      imageUrls,
    );

    const parsed = parseProductInput(
      {
        ...form,
        primaryImageUrl,
        galleryUrls,
        sizes: sizesText.split(/[,،]/).map((s) => s.trim()).filter(Boolean),
      },
      { isNew },
    );

    if (!parsed.primaryImageUrl) {
      setError("لطفاً حداقل یک تصویر برای محصول اضافه کنید.");
      setBusy(false);
      return;
    }
    if (!parsed.colors.length) {
      setError("حداقل یک رنگ با نام وارد کنید.");
      setBusy(false);
      return;
    }

    try {
      await onSubmit(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق");
      setBusy(false);
    }
  }

  const mainPreview = imageUrls[0] ? assetPath(imageUrls[0]) : "";

  return (
    <>
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <label className="block text-sm">
        <span className="text-muted">نام محصول</span>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted">قیمت (تومان)</span>
        <input
          required
          type="number"
          min={0}
          value={form.price || ""}
          onChange={(e) =>
            setForm({ ...form, price: Number(e.target.value) })
          }
          className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">کالکشن</span>
          <select
            value={form.collection}
            onChange={(e) => {
              const collection = e.target.value as CollectionSlug;
              setForm((prev) => ({
                ...prev,
                collection,
                category: categoryForCollection(collection, prev.category),
              }));
            }}
            className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm"
          >
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">دسته</span>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-muted">توضیحات</span>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm leading-7"
        />
      </label>

      <fieldset className="space-y-4 rounded-xl border border-white/10 p-4">
        <legend className="px-1 text-sm text-muted">گالری تصاویر</legend>
        <p className="text-xs leading-6 text-muted">
          تصویر اول = تصویر اصلی در لیست فروشگاه. مشتری در صفحهٔ محصول بین
          تصاویر جابه‌جا می‌شود و بندانگشتی‌ها زیر تصویر اصلی نمایش داده
          می‌شوند.
        </p>

        {mainPreview && (
          <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-xl bg-surface ring-1 ring-white/10">
            <Image
              src={mainPreview}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative flex flex-col items-center gap-1"
              >
                <button
                  type="button"
                  className={`relative size-16 overflow-hidden rounded-lg bg-surface ring-1 sm:size-20 ${
                    index === 0
                      ? "ring-2 ring-gold"
                      : "ring-white/15 hover:ring-gold/50"
                  }`}
                  onClick={() => setPrimaryImage(index)}
                  title={index === 0 ? "تصویر اصلی" : "انتخاب به‌عنوان تصویر اصلی"}
                >
                  <Image
                    src={assetPath(url)}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
                <div className="flex gap-2 text-[10px] text-muted">
                  {index === 0 ? (
                    <span className="text-gold">اصلی</span>
                  ) : (
                    <button
                      type="button"
                      className="hover:text-cream"
                      onClick={() => setPrimaryImage(index)}
                    >
                      اصلی کن
                    </button>
                  )}
                  <button
                    type="button"
                    className="hover:text-red-300"
                    onClick={() => removeImage(index)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <label
          className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/25 bg-ink/50 transition hover:border-gold/50 hover:bg-surface/40"
        >
          <span className="text-2xl leading-none text-gold" aria-hidden>+</span>
          <span className="text-xs text-muted">افزودن تصویر</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void (async () => {
                  setError(null);
                  try {
                    setCropFile(await prepareImageForUpload(file));
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "آپلود ناموفق",
                    );
                  }
                })();
              }
              e.target.value = "";
            }}
          />
        </label>
      </fieldset>

      <label className="block text-sm">
        <span className="text-muted">سایزها (با کاما)</span>
        <input
          required
          value={sizesText}
          onChange={(e) => setSizesText(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm"
          dir="ltr"
        />
      </label>

      <fieldset className="space-y-3 rounded-xl border border-white/10 p-4">
        <legend className="px-1 text-sm text-muted">رنگ‌ها</legend>
        {form.colors.map((color, index) => (
          <div key={index} className="flex flex-wrap items-end gap-2">
            <input
              placeholder="نام رنگ"
              value={color.name}
              onChange={(e) => updateColor(index, { name: e.target.value })}
              className="min-w-32 flex-1 rounded border border-white/15 bg-ink px-2 py-1.5 text-sm"
            />
            <input
              type="color"
              value={color.hex}
              onChange={(e) => updateColor(index, { hex: e.target.value })}
              className="size-9 cursor-pointer rounded border border-white/15 bg-transparent"
              aria-label="انتخاب رنگ"
            />
            <button
              type="button"
              className="text-xs text-muted hover:text-cream"
              onClick={() => removeColor(index)}
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-sm text-gold"
          onClick={addColor}
        >
          افزودن رنگ
        </button>
      </fieldset>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-gold py-3 text-sm font-medium text-ink disabled:opacity-50 sm:w-auto sm:px-10"
      >
        {busy ? "در حال ذخیره…" : isNew ? "ایجاد محصول" : "ذخیره تغییرات"}
      </button>
    </form>

    <AdminImageCropModal
      file={cropFile}
      title="برش تصویر محصول"
      aspect={3 / 4}
      cropShape="rect"
      onClose={() => setCropFile(null)}
      onConfirm={async (cropped) => {
        setCropFile(null);
        await uploadGalleryImage(cropped);
      }}
    />
    </>
  );
}
