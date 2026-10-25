import type { NextConfig } from "next";
import path from "node:path";
import { getBasePath } from "./lib/base-path";

const basePath = getBasePath();

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL:
      process.env.SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "",
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: "/api/files/:path*",
        },
      ],
    };
  },
  async headers() {
    // Avoid long-lived HTML cache: after redeploy, old HTML can reference removed CSS chunks.
    return [
      {
        source: "/:path((?!_next/static|_next/image|favicon.ico|images|uploads).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/images/**" },
      { pathname: "/api/files/**" },
    ],
  },
  cacheComponents: false,
  partialPrefetching: false,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
