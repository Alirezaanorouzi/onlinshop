import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getCatalogBackend } from "@/lib/env";

/**
 * Single rule for the live shop on Liara:
 * - Admin CRUD → SQLite on disk (`data/catalog.sqlite`)
 * - Storefront must read that DB on every request (not `catalog.json` from build)
 *
 * Set `CATALOG_BACKEND=sqlite` in Liara env for both build and runtime.
 */
export function catalogUsesSqliteAtRuntime(): boolean {
  return getCatalogBackend() === "sqlite";
}

/** Call at the start of server components that list/read products. */
export function markCatalogRequestDynamic(): void {
  if (catalogUsesSqliteAtRuntime()) {
    noStore();
  }
}
