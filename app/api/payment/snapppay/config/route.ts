import { isSqliteCatalog } from "@/lib/env";
import { isSnappPayConfigured } from "@/lib/snapppay";

export async function GET() {
  const configured = isSnappPayConfigured();
  const sqliteBackend = isSqliteCatalog();
  return Response.json({
    enabled: configured && sqliteBackend,
    configured,
    sqliteBackend,
  });
}
