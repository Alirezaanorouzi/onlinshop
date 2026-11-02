import { buildOrganizationJsonLd } from "@/lib/seo/organization-jsonld";

export function OrganizationJsonLd({ request }: { request?: Request }) {
  const json = buildOrganizationJsonLd(request);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
