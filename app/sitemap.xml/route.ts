import fs from "node:fs";
import path from "node:path";

/** Serves root `sitemap.xml` at /sitemap.xml (file is not under public/). */
export async function GET() {
  const filePath = path.join(process.cwd(), "sitemap.xml");
  const xml = fs.readFileSync(filePath, "utf8");
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
