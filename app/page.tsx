import type { Metadata } from "next";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { HomePage } from "@/components/HomePage";
import { markCatalogRequestDynamic } from "@/lib/catalog-runtime";
import { business } from "@/lib/business";
import {
  getStoreOgImageUrl,
  socialImageMetadata,
  storeOgImageAlt,
} from "@/lib/seo/share-image";
import { absolutePath, HOME_PAGE_TITLE } from "@/lib/seo/site";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const homeDescription = `${business.tagline} خرید آنلاین لباس زنانه و مردانه از ${site.name}.`;

export async function generateMetadata(): Promise<Metadata> {
  markCatalogRequestDynamic();
  const imageUrl = getStoreOgImageUrl();
  const { openGraphImages, twitter } = socialImageMetadata(
    imageUrl,
    storeOgImageAlt,
  );

  return {
    title: { absolute: HOME_PAGE_TITLE },
    description: homeDescription,
    alternates: { canonical: absolutePath("/") },
    openGraph: {
      title: HOME_PAGE_TITLE,
      description: homeDescription,
      url: absolutePath("/"),
      type: "website",
      images: openGraphImages,
    },
    twitter: {
      ...twitter,
      title: HOME_PAGE_TITLE,
      description: homeDescription,
    },
  };
}

export default function Home() {
  markCatalogRequestDynamic();
  return (
    <>
      <OrganizationJsonLd />
      <HomePage />
    </>
  );
}
