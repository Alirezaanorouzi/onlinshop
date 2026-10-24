import Database from "better-sqlite3";
import path from "node:path";
import { getCatalogBackend, getSqlitePath, isSqliteCatalog } from "@/lib/env";
import { runMigrations } from "@/lib/migrate";

export function GET() {
  let adminUsers = 0;
  if (isSqliteCatalog()) {
    try {
      runMigrations();
      const filePath = path.resolve(process.cwd(), getSqlitePath());
      const sqlite = new Database(filePath, { readonly: true });
      const row = sqlite
        .prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'")
        .get() as { c: number };
      adminUsers = row?.c ?? 0;
      sqlite.close();
    } catch {
      adminUsers = -1;
    }
  }

  return Response.json({
    ok: true,
    catalog: getCatalogBackend(),
    adminUsers,
  });
}
