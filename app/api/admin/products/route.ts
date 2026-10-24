import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin-auth";
import {
  type AdminProductBody,
  validateAdminProductBody,
} from "@/lib/admin-product-validate";
import { upsertProduct } from "@/lib/catalog-db";
import { isSqliteCatalog } from "@/lib/env";
import { normalizeProductGallery } from "@/lib/product-gallery";
import { createProductSlug } from "@/lib/slug";

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

  const body = (await request.json()) as AdminProductBody;
  const error = validateAdminProductBody(body);
  if (error) return Response.json({ error }, { status: 400 });

  const { primaryImageUrl, galleryUrls } = normalizeProductGallery(
    body.primaryImageUrl,
    body.galleryUrls,
  );

  const { getProductBySlug } = await import("@/lib/catalog-db");
  let slug = body.slug?.trim();
  if (!slug) slug = createProductSlug(body.name, body.collection);
  while (getProductBySlug(slug)) {
    slug = createProductSlug(body.name, body.collection);
  }

  upsertProduct({
    slug,
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
  revalidatePath(`/product/${slug}`);

  return Response.json({ ok: true, slug });
}
