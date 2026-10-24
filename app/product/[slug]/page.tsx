import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { ProductSpecifications } from "@/components/ProductSpecifications";
import { assetPath } from "@/lib/asset-path";
import { getProductImages } from "@/lib/product-images";
import { getProductShareUrl } from "@/lib/product-share-url";
import { getCollection } from "@/lib/catalog";
import { getPublicSiteUrl } from "@/lib/site-url";
import {
  getCategory,
  getProductBySlug,
} from "@/lib/catalog-server";

/** SQLite admin catalog: render from DB per request (avoids DYNAMIC_SERVER_USAGE). */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "محصول" };

  const url = getProductShareUrl(slug);
  const origin = getPublicSiteUrl().replace(/\/$/, "");
  const imageRel = assetPath(product.image);
  const ogImage = imageRel.startsWith("http")
    ? imageRel
    : `${origin}${imageRel.startsWith("/") ? imageRel : `/${imageRel}`}`;

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description: product.description,
      url,
      type: "website",
      images: [{ url: ogImage, alt: product.name }],
    },
  };
}

export default async function ProductPage({
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
    <article className="mx-auto grid max-w-6xl gap-8 px-3 py-8 sm:gap-10 sm:px-4 sm:py-12 lg:grid-cols-2">
      <ProductImageGallery
        images={getProductImages(product)}
        alt={product.name}
        variant="detail"
        priority
      />
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
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl md:text-4xl">
          {product.name}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-8 text-cream/80">
          {product.description}
        </p>
        <AddToCart product={product} />
        <ProductSpecifications
          product={product}
          collectionTitle={collection?.title}
          categoryName={category?.name}
        />
      </div>
    </article>
  );
}
