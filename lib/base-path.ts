/** Optional subpath hosting (usually empty on Liara and local dev). */
export function getBasePath(): string {
  const explicit = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (!explicit) return "";
  return explicit.startsWith("/") ? explicit : `/${explicit}`;
}
