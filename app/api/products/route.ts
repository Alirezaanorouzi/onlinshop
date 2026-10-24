import { getProducts } from "@/lib/catalog-server";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const query = searchParams.get("query") ?? undefined;
  const slugs = searchParams.get("slugs");

  const products = getProducts({
    collection,
    category,
    query,
    slugs: slugs ? slugs.split(",").filter(Boolean) : undefined,
  });

  return Response.json({ products });
}
