import { resolveProductBySlugParam } from "@/lib/catalog-server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const product = resolveProductBySlugParam(slug);
  if (!product) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ product });
}
