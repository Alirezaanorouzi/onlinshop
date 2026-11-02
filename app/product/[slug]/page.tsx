import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { ProductShareButton } from "@/components/ProductShareButton";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { ProductSpecifications } from "@/components/ProductSpecifications";
import { getProductImages } from "@/lib/product-images";
import { ProductJsonLd } from "@/components/ProductJsonLd";
import { getProductShareUrl } from "@/lib/product-share-url";
import {
  getProductOgImageUrl,
  socialImageMetadata,
} from "@/lib/seo/share-image";
import {
  resolveLongDescription,
  resolveSeoDescription,
  resolveSeoTitle,
} from "@/lib/seo/product-meta";
import { getCollection } from "@/lib/catalog";
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
  const title = resolveSeoTitle(product);
  const description = resolveSeoDescription(product);
  const ogImage = getProductOgImageUrl(product);
  const { openGraphImages, twitter } = socialImageMetadata(ogImage, product.name);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: openGraphImages,
    },
    twitter: {
      ...twitter,
      title,
      description,
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
  const longDescription = resolveLongDescription(product);
  const showLong =
    product.longDescription?.trim() &&
    product.longDescription.trim() !== product.description.trim();

  return (
    <>
      <ProductJsonLd product={product} />
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
        <div className="mt-4 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
            {product.name}
          </h1>
          <ProductShareButton
            slug={product.slug}
            productName={product.name}
            variant="inline"
          />
        </div>
        <p className="mt-4 max-w-md text-sm leading-8 text-cream/80">
          {product.description}
        </p>
        {showLong ? (
          <div className="mt-4 max-w-lg space-y-3 text-sm leading-8 text-cream/85">
            {longDescription.split(/\n+/).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        ) : null}
        <AddToCart product={product} />
        <ProductSpecifications
          product={product}
          collectionTitle={collection?.title}
          categoryName={category?.name}
        />
      </div>
    </article>
    </>
  );
}
