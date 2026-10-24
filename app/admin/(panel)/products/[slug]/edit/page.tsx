"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { adminFetch, saveProduct } from "@/lib/admin-api";
import { productToInput } from "@/lib/product-input";
import type { Product } from "@/lib/types";
import { slugFromParams } from "@/lib/slug-param";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = slugFromParams(params.slug);
  const [initial, setInitial] = useState<ReturnType<typeof productToInput> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    adminFetch(`/api/admin/products/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          try {
            const body = JSON.parse(text) as { error?: string };
            setError(body.error ?? text);
          } catch {
            setError(text);
          }
          return;
        }
        const data = (await response.json()) as { product: Product };
        setInitial(productToInput(data.product));
      })
      .catch(() => setError("بارگذاری ناموفق"));
  }, [slug]);

  if (error) {
    return (
      <p className="px-4 py-20 text-sm text-red-300">{error}</p>
    );
  }

  if (!initial) {
    return <p className="px-4 py-20 text-sm text-muted">در حال بارگذاری…</p>;
  }

  return (
    <>
      <h1 className="px-4 pt-8 text-xl font-semibold">ویرایش محصول</h1>
      <ProductForm
        initial={initial}
        isNew={false}
        onSubmit={async (input) => {
          await saveProduct(input, false);
          router.push("/admin");
        }}
      />
    </>
  );
}
