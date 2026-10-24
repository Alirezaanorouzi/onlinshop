import { assertAdmin } from "@/lib/admin-auth";
import { uploadObject } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    assertAdmin(request);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  const form = await request.formData();
  const file = form.get("file");
  const prefix = String(form.get("prefix") ?? "products");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file field" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadObject({
    buffer,
    mimeType: file.type || "application/octet-stream",
    originalName: file.name,
    prefix,
  });

  return Response.json(result);
}
