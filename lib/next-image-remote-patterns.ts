import type { RemotePattern } from "next/dist/shared/lib/image-config";

function patternFromBaseUrl(raw: string | undefined): RemotePattern | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    const protocol = url.protocol.replace(":", "") as "http" | "https";
    if (protocol !== "http" && protocol !== "https") return null;
    return {
      protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

/** Hostnames allowed for next/image when product URLs are absolute (S3, own domain). */
export function getImageRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [];
  for (const envKey of [
    "S3_PUBLIC_BASE_URL",
    "SITE_URL",
    "NEXT_PUBLIC_SITE_URL",
  ]) {
    const pattern = patternFromBaseUrl(process.env[envKey]);
    if (pattern) patterns.push(pattern);
  }
  return patterns;
}
