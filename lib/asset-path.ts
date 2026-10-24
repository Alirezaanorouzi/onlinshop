import { apiPath } from "@/lib/api-path";

/** Prefix public asset URLs for GitHub Pages (e.g. /onlinshop/images/...). */
export function assetPath(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/")) return path;

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  let normalized = path;
  if (base && !normalized.startsWith(`${base}/`)) {
    normalized = `${base}${normalized}`;
  }

  const uploadsPrefix = base ? `${base}/uploads/` : "/uploads/";
  if (normalized.startsWith(uploadsPrefix)) {
    const rest = normalized.slice(uploadsPrefix.length);
    return apiPath(`/api/files/${rest}`);
  }

  if (normalized.startsWith("/api/files/")) {
    return apiPath(normalized);
  }

  return normalized;
}
