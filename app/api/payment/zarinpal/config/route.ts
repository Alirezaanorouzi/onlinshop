import { isSqliteCatalog } from "@/lib/env";
import { isZarinpalConfigured } from "@/lib/zarinpal";

export async function GET() {
  const merchantConfigured = isZarinpalConfigured();
  const sqliteBackend = isSqliteCatalog();
  return Response.json({
    enabled: merchantConfigured && sqliteBackend,
    merchantConfigured,
    sqliteBackend,
  });
}
