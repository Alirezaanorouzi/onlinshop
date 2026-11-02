import type { MetadataRoute } from "next";
import { getBasePath } from "@/lib/base-path";
import { absolutePath } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const base = getBasePath().replace(/\/$/, "");
  const disallow = [
    `${base}/admin`,
    `${base}/login`,
    `${base}/account`,
    `${base}/cart`,
  ].map((path) => path.replace("//", "/"));

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: absolutePath("/sitemap.xml"),
  };
}
