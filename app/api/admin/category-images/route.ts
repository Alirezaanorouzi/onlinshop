import { assertAdmin } from "@/lib/admin-auth";
import {
  listAdminCategoryImages,
  upsertCategoryImage,
} from "@/lib/catalog-db";
import { revalidateStorefrontCatalog } from "@/lib/catalog-revalidate";
import { isSqliteCatalog } from "@/lib/env";
import { uploadObject } from "@/lib/storage";
import type { CollectionSlug } from "@/lib/types";

function parseCollection(value: string | null): CollectionSlug | null {
  if (value === "men" || value === "women") return value;
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
      { error: "Admin requires CATALOG_BACKEND=sqlite" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const collection = parseCollection(searchParams.get("collection"));
  if (!collection) {
    return Response.json({ error: "collection=men|women required" }, { status: 400 });
  }

  return Response.json({
    collection,
    categories: listAdminCategoryImages(collection),
  });
}

type PutBody = {
  collection?: CollectionSlug;
  categorySlug?: string;
  imageUrl?: string;
};

export async function PUT(request: Request) {
  try {
    assertAdmin(request);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  if (!isSqliteCatalog()) {
    return Response.json(
      { error: "Admin requires CATALOG_BACKEND=sqlite" },
      { status: 503 },
    );
  }

  let body: PutBody;
  try {
    body = (await request.json()) as PutBody;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const collection = parseCollection(body.collection ?? null);
  const categorySlug = body.categorySlug?.trim();
  const imageUrl = body.imageUrl?.trim();
  if (!collection || !categorySlug || !imageUrl) {
    return Response.json({ error: "missing fields" }, { status: 400 });
  }

  try {
    upsertCategoryImage(collection, categorySlug, imageUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "save failed";
    return Response.json({ error: message }, { status: 400 });
  }

  revalidateStorefrontCatalog({ collection, category: categorySlug });

  return Response.json({
    ok: true,
    categories: listAdminCategoryImages(collection),
  });
}

/** Upload file + save `category_images` in one step (same flow as product images). */
export async function POST(request: Request) {
  try {
    assertAdmin(request);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  if (!isSqliteCatalog()) {
    return Response.json(
      { error: "Admin requires CATALOG_BACKEND=sqlite" },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const collection = parseCollection(String(form.get("collection") ?? ""));
  const categorySlug = String(form.get("categorySlug") ?? "").trim();

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (!collection || !categorySlug) {
    return Response.json({ error: "missing collection or category" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadObject({
      buffer,
      mimeType: file.type || "application/octet-stream",
      originalName: file.name,
      prefix: "categories",
    });
    upsertCategoryImage(collection, categorySlug, uploaded.publicUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "upload failed";
    return Response.json({ error: message }, { status: 400 });
  }

  revalidateStorefrontCatalog({ collection, category: categorySlug });

  const categories = listAdminCategoryImages(collection);
  return Response.json({ ok: true, categories });
}
