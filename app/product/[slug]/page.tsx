import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCart } from "@/components/AddToCart";
import {
  getCategory,
  getCollection,
  getProductBySlug,
  getProducts,
} from "@/lib/catalog";

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return { title: product?.name ?? "محصول" };
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="px-4 py-20 text-sm text-muted">در حال بارگذاری…</p>}
    >
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const collection = getCollection(product.collection);
  const category = getCategory(product.collection, product.category);

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface">
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
      <div>
        <p className="text-sm text-muted">
          <Link
            href={`/collection/${product.collection}`}
            className="hover:text-cream"
          >
            {collection?.title}
          </Link>
          {category && (
            <>
              <span className="px-2">/</span>
              <Link
                href={`/collection/${product.collection}/${category.slug}`}
                className="hover:text-cream"
              >
                {category.name}
              </Link>
            </>
          )}
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{product.name}</h1>
        <p className="mt-4 max-w-md text-sm leading-8 text-cream/80">
          {product.description}
        </p>
        <AddToCart product={product} />
      </div>
    </article>
  );
}
