import { assertAdmin } from "@/lib/admin-auth";
import { getCatalogBackend } from "@/lib/env";

export function GET(request: Request) {
  try {
    assertAdmin(request);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  return Response.json({ ok: true, catalog: getCatalogBackend() });
}
