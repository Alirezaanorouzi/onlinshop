import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductStrip } from "@/components/ProductStrip";
import {
  getCategories,
  getCategory,
  getCollection,
  getCollections,
  getProducts,
} from "@/lib/catalog";

export function generateStaticParams() {
  return getCollections().flatMap((collection) =>
    getCategories(collection.slug).map((category) => ({
      slug: collection.slug,
      category: category.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; category: string }>;
}) {
  const { slug, category: categorySlug } = await params;
  const category = getCategory(slug, categorySlug);
  return { title: category?.name ?? "دسته‌بندی" };
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; category: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="px-4 py-20 text-sm text-muted">در حال بارگذاری…</p>}
    >
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({
  params,
}: {
  params: Promise<{ slug: string; category: string }>;
}) {
  const { slug, category: categorySlug } = await params;
  const collection = getCollection(slug);
  const category = getCategory(slug, categorySlug);
  if (!collection || !category) notFound();

  const products = getProducts({ collection: slug, category: categorySlug });

  return (
    <div className="pt-10">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm text-muted">
          <Link href={`/collection/${slug}`} className="hover:text-cream">
            {collection.title}
          </Link>
          <span className="px-2">/</span>
          <span>{category.name}</span>
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{category.name}</h1>
      </div>
      <div className="mt-10">
        <ProductStrip title="محصولات" products={products} />
      </div>
    </div>
  );
}
