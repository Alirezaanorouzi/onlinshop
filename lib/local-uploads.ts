import fs from "node:fs";
import path from "node:path";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export function resolveLocalUploadPath(segments: string[]): string | null {
  if (!segments.length) return null;
  if (segments.some((part) => part === ".." || part.includes("\0"))) return null;

  const absolute = path.join(UPLOADS_ROOT, ...segments);
  const normalizedRoot = path.normalize(UPLOADS_ROOT + path.sep);
  if (!path.normalize(absolute).startsWith(normalizedRoot)) return null;
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) return null;

  return absolute;
}

export function mimeTypeForUploadPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME[ext] ?? "application/octet-stream";
}
