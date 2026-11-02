import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { markCatalogRequestDynamic } from "@/lib/catalog-runtime";
import { business } from "@/lib/business";
import { absolutePath, HOME_PAGE_TITLE } from "@/lib/seo/site";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const homeDescription = `${business.tagline} خرید آنلاین لباس زنانه و مردانه از ${site.name}.`;

export const metadata: Metadata = {
  title: { absolute: HOME_PAGE_TITLE },
  description: homeDescription,
  alternates: { canonical: absolutePath("/") },
  openGraph: {
    title: HOME_PAGE_TITLE,
    description: homeDescription,
    url: absolutePath("/"),
    type: "website",
  },
};

export default function Home() {
  markCatalogRequestDynamic();
  return <HomePage />;
}
