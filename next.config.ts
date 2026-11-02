import type { NextConfig } from "next";
import path from "node:path";
import { getBasePath } from "./lib/base-path";
import { getAllowedDevOrigins } from "./lib/dev-allowed-origins";
import { getImageRemotePatterns } from "./lib/next-image-remote-patterns";

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
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 64, 96, 128, 256, 384],
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/images/**" },
      { pathname: "/api/files/**" },
    ],
    remotePatterns: getImageRemotePatterns(),
  },
  cacheComponents: false,
  partialPrefetching: false,
  allowedDevOrigins: getAllowedDevOrigins(),
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
