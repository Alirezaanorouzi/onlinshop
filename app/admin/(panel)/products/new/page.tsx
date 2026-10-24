"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { saveProduct } from "@/lib/admin-api";
import { emptyProductInput } from "@/lib/product-input";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <>
      <h1 className="px-4 pt-8 text-xl font-semibold">محصول جدید</h1>
      <ProductForm
        initial={emptyProductInput()}
        isNew
        onSubmit={async (input) => {
          await saveProduct(input, true);
          router.push("/admin");
        }}
      />
    </>
  );
}
