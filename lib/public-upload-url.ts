import { apiPath } from "@/lib/api-path";

/** Public URL for a file stored under `public/uploads/…` (Liara serves via `/api/files`). */
export function publicUrlForLocalUpload(objectKey: string): string {
  const key = objectKey.replace(/\\/g, "/").replace(/^\/+/, "");
  const rest = key.startsWith("uploads/") ? key.slice("uploads/".length) : key;
  return apiPath(`/api/files/${rest}`);
}
