import fs from "node:fs";
import {
  mimeTypeForUploadPath,
  resolveLocalUploadPath,
} from "@/lib/local-uploads";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const absolute = resolveLocalUploadPath(segments);
  if (!absolute) {
    return new Response("Not found", { status: 404 });
  }

  const body = fs.readFileSync(absolute);
  return new Response(body, {
    headers: {
      "Content-Type": mimeTypeForUploadPath(absolute),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
