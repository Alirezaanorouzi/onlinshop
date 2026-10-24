import { assertAdmin } from "@/lib/admin-auth";
import { upsertProduct } from "@/lib/catalog-db";
import { isSqliteCatalog } from "@/lib/env";
import { createProductSlug } from "@/lib/slug";
import type { CollectionSlug, Color } from "@/lib/types";

type Body = {
  slug: string;
  name: string;
  collection: CollectionSlug;
  category: string;
  price: number;
  description: string;
  primaryImageUrl: string;
  galleryUrls?: string[];
  colors: Color[];
  sizes: string[];
};

function validate(body: Body) {
  if (!body.name) return "name is required";
  if (!body.collection || !body.category) return "collection and category required";
  if (!Number.isFinite(body.price) || body.price < 0) return "invalid price";
  if (!body.primaryImageUrl) return "primary image is required";
  if (!body.colors?.length) return "at least one color required";
  if (!body.sizes?.length) return "at least one size required";
  return null;
}

export async function GET(request: Request) {
  try {
    assertAdmin(request);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  if (!isSqliteCatalog()) {
    return Response.json(
      { error: "Admin CRUD requires CATALOG_BACKEND=sqlite" },
      { status: 503 },
    );
  }

  const { getProducts } = await import("@/lib/catalog-db");
  return Response.json({ products: getProducts() });
}

export async function POST(request: Request) {
  try {
    assertAdmin(request);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  if (!isSqliteCatalog()) {
    return Response.json(
      { error: "Admin CRUD requires CATALOG_BACKEND=sqlite" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as Body;
  const error = validate(body);
  if (error) return Response.json({ error }, { status: 400 });

  const { getProductBySlug } = await import("@/lib/catalog-db");
  let slug = body.slug?.trim();
  if (!slug) slug = createProductSlug(body.name, body.collection);
  while (getProductBySlug(slug)) {
    slug = createProductSlug(body.name, body.collection);
  }

  upsertProduct({
    slug,
    name: body.name,
    collection: body.collection,
    category: body.category,
    price: Math.round(body.price),
    description: body.description,
    primaryImageUrl: body.primaryImageUrl,
    galleryUrls: body.galleryUrls ?? [],
    colors: body.colors,
    sizes: body.sizes,
  });

  return Response.json({ ok: true, slug });
}
