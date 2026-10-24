import type { NextConfig } from "next";
import path from "node:path";
import { getBasePath } from "./lib/base-path";

const basePath = getBasePath();
const isStaticExport = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  trailingSlash: isStaticExport ? true : undefined,
  async rewrites() {
    if (isStaticExport) return [];
    return {
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: "/api/files/:path*",
        },
      ],
    };
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
