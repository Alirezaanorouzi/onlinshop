import Link from "next/link";
import { notFound } from "next/navigation";
import { markCatalogRequestDynamic } from "@/lib/catalog-runtime";
import { CategoryCircles } from "@/components/CategoryCircles";
import { CollectionHero } from "@/components/CollectionHero";
import { ProductStrip } from "@/components/ProductStrip";
import { SnappPayPromo } from "@/components/SnappPayPromo";
import { getCollection } from "@/lib/catalog";
import {
  categoryStaticParams,
  getProducts,
} from "@/lib/catalog-server";
import { categoryCanonical } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categoryStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; category: string }>;
}) {
  const { slug, category: categorySlug } = await params;
  const collection = getCollection(slug);
  const category = collection?.categories.find((c) => c.slug === categorySlug);
  if (!collection || !category) return { title: "دسته‌بندی" };

  const title = `${category.name} | ${collection.title}`;
  const description = `${category.name} — ${collection.description}`;
  const url = categoryCanonical(slug, categorySlug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; category: string }>;
}) {
  markCatalogRequestDynamic();

  const { slug, category: categorySlug } = await params;
  const collection = getCollection(slug);
  const category = collection?.categories.find((c) => c.slug === categorySlug);
  if (!collection || !category) notFound();

  const products = getProducts({ collection: slug, category: categorySlug });
  if (products.length === 0) notFound();

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
        <p className="mt-4 max-w-2xl text-sm leading-8 text-cream/80">
          {collection.description}
        </p>
      </div>
      <div className="mt-10">
        <ProductStrip title="محصولات" products={products} />
      </div>
    </div>
  );
}
