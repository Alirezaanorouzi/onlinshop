/** Prefix API routes when the app is served under a basePath (e.g. GitHub Pages). */
export function apiPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}
