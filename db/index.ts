import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "@/db/schema";
import { runMigrations } from "@/lib/migrate";

let sqlite: Database.Database | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let schemaReady = false;

export function getDb() {
  if (!schemaReady) {
    runMigrations();
    schemaReady = true;
  }
  if (db) return db;

  const custom = process.env.SQLITE_PATH?.trim();
  const filePath = custom
    ? path.isAbsolute(custom)
      ? custom
      : path.join(/* turbopackIgnore: true */ process.cwd(), custom)
    : path.join(process.cwd(), "data", "catalog.sqlite");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  db = drizzle(sqlite, { schema });
  return db;
}

export function closeDb() {
  sqlite?.close();
  sqlite = null;
  db = null;
}
