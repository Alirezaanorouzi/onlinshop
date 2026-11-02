import { business } from "@/lib/business";
import { absolutePath } from "@/lib/seo/site";
import { site } from "@/lib/site";

const STORE_NAME = "پوشاک قائم مقام";

function isPlaceholder(value: string): boolean {
  return value.includes("【") || !value.trim();
}

/** Real storefront data only — omits fields that are env placeholders. */
export function buildOrganizationJsonLd(request?: Request) {
  const url = absolutePath("/", request);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: STORE_NAME,
    alternateName: site.name,
    url,
    description: business.tagline,
  };

  if (!isPlaceholder(business.phoneMobile)) {
    data.telephone = business.phoneMobile;
  }
  if (!isPlaceholder(business.email)) {
    data.email = business.email;
  }

  const addressParts: Record<string, string> = {};
  if (!isPlaceholder(business.address)) {
    addressParts.streetAddress = business.address;
  }
  if (business.city.trim()) {
    addressParts.addressLocality = business.city;
  }
  addressParts.addressCountry = "IR";
  if (business.postalCode.trim()) {
    addressParts.postalCode = business.postalCode;
  }
  if (Object.keys(addressParts).length > 1) {
    data.address = {
      "@type": "PostalAddress",
      ...addressParts,
    };
  }

  if (business.hours.trim()) {
    data.openingHours = business.hours;
  }

  if (business.instagram.trim()) {
    data.sameAs = [business.instagram];
  }

  return data;
}

export { STORE_NAME as homePageH1 };
