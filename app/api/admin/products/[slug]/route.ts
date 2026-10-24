import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin-auth";
import {
  type AdminProductBody,
  validateAdminProductBody,
} from "@/lib/admin-product-validate";
import { deleteProduct, upsertProduct } from "@/lib/catalog-db";
import { resolveProductBySlugParam } from "@/lib/catalog-server";
import { isSqliteCatalog } from "@/lib/env";
import { normalizeProductGallery } from "@/lib/product-gallery";

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

  const body = (await request.json()) as AdminProductBody;
  if (body.slug !== paramSlug) {
    return Response.json({ error: "slug cannot be changed" }, { status: 400 });
  }

  const error = validateAdminProductBody(body, { requireSlug: true });
  if (error) return Response.json({ error }, { status: 400 });

  const { primaryImageUrl, galleryUrls } = normalizeProductGallery(
    body.primaryImageUrl,
    body.galleryUrls,
  );

  upsertProduct({
    slug: body.slug,
    name: body.name.trim(),
    collection: body.collection,
    category: body.category,
    price: Math.round(body.price),
    description: body.description,
    primaryImageUrl,
    galleryUrls,
    colors: body.colors,
    sizes: body.sizes,
  });

  revalidatePath(`/collection/${body.collection}`);
  revalidatePath(`/collection/${body.collection}/${body.category}`);
  revalidatePath(`/product/${body.slug}`);
  if (existing.collection !== body.collection) {
    revalidatePath(`/collection/${existing.collection}`);
    revalidatePath(
      `/collection/${existing.collection}/${existing.category}`,
    );
  }
  if (
    existing.category !== body.category &&
    existing.collection === body.collection
  ) {
    revalidatePath(
      `/collection/${existing.collection}/${existing.category}`,
    );
  }

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
  revalidatePath(`/collection/${existing.collection}`);
  revalidatePath(
    `/collection/${existing.collection}/${existing.category}`,
  );
  revalidatePath(`/product/${existing.slug}`);
  return Response.json({ ok: true });
}
