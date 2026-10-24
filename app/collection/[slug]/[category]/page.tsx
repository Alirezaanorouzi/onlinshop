import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductStrip } from "@/components/ProductStrip";
import { getCollections, getCollection } from "@/lib/catalog";
import {
  getCategories,
  getCategory,
  getProducts,
} from "@/lib/catalog-server";
import {
  catalogIsDatabaseBacked,
  staticCategoryParams,
} from "@/lib/catalog-pages";

export function generateStaticParams() {
  if (catalogIsDatabaseBacked()) {
    return staticCategoryParams();
  }
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; category: string }>;
}) {
  if (catalogIsDatabaseBacked()) noStore();

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
