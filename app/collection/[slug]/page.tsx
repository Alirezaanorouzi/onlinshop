import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryCircles } from "@/components/CategoryCircles";
import { CollectionHero } from "@/components/CollectionHero";
import { ProductStrip } from "@/components/ProductStrip";
import { SnappPayPromo } from "@/components/SnappPayPromo";
import { getCategories, getCollection, getProducts } from "@/lib/catalog";

export function generateStaticParams() {
  return [{ slug: "men" }, { slug: "women" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollection(slug);
  return { title: collection?.title ?? "کالکشن" };
}

export default function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="px-4 py-20 text-sm text-muted">در حال بارگذاری…</p>}
    >
      <CollectionContent params={params} />
    </Suspense>
  );
}

async function CollectionContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const products = getProducts({ collection: slug });

  return (
    <>
      {slug === "men" ? (
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
            <CollectionHero
              collection={collection}
              count={products.length}
              compact
            />
            <SnappPayPromo compact />
          </div>
        </section>
      ) : (
        <CollectionHero collection={collection} count={products.length} />
      )}
      <CategoryCircles
        collection={slug}
        categories={getCategories(slug)}
      />
      <ProductStrip title="محصولات" products={products} />
    </>
  );
}
