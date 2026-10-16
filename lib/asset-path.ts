/** Prefix public asset URLs for GitHub Pages (e.g. /onlinshop/images/...). */
export function assetPath(path: string): string {
  if (!path.startsWith("/")) return path;

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base || path.startsWith(`${base}/`)) return path;

  return `${base}${path}`;
}
