import { assertAdmin } from "@/lib/admin-auth";
import { deleteProduct, upsertProduct } from "@/lib/catalog-db";
import { resolveProductBySlugParam } from "@/lib/catalog-server";
import { isSqliteCatalog } from "@/lib/env";
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
  if (!body.slug || !body.name) return "slug and name are required";
  if (!body.collection || !body.category) return "collection and category required";
  if (!Number.isFinite(body.price) || body.price < 0) return "invalid price";
  if (!body.primaryImageUrl) return "primary image is required";
  if (!body.colors?.length) return "at least one color required";
  if (!body.sizes?.length) return "at least one size required";
  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
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

  const { slug: slugParam } = await context.params;
  const product = resolveProductBySlugParam(slugParam);
  if (!product) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ product });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
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

  const { slug: slugParam } = await context.params;
  const existing = resolveProductBySlugParam(slugParam);
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const paramSlug = existing.slug;

  const body = (await request.json()) as Body;
  if (body.slug !== paramSlug) {
    return Response.json({ error: "slug cannot be changed" }, { status: 400 });
  }

  const error = validate(body);
  if (error) return Response.json({ error }, { status: 400 });

  upsertProduct({
    slug: body.slug,
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

  return Response.json({ ok: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
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

  const { slug: slugParam } = await context.params;
  const existing = resolveProductBySlugParam(slugParam);
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  deleteProduct(existing.slug);
  return Response.json({ ok: true });
}
