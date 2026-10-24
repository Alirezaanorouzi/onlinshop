import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { catalogIsDatabaseBacked } from "@/lib/catalog-pages";
import { CategoryCircles } from "@/components/CategoryCircles";
import { CollectionHero } from "@/components/CollectionHero";
import { ProductStrip } from "@/components/ProductStrip";
import { SnappPayPromo } from "@/components/SnappPayPromo";
import { getCollection } from "@/lib/catalog";
import { getCategories, getProducts } from "@/lib/catalog-server";

/** SQLite catalog on Liara: must not bake `catalog.json` at build into this page. */
export const dynamic = "force-dynamic";

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

export default async function CollectionPage({
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
        <section className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-10 md:py-14">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
            <CollectionHero
              collection={collection}
              count={products.length}
              compact
            />
            <SnappPayPromo
              compact
              featured={
                getProducts({ collection: "men", category: "hoodie" })[0] ??
                getProducts({ collection: "men" })[0] ??
                null
              }
            />
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
