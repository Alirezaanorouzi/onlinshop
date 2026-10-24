import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

process.env.CATALOG_BACKEND = "sqlite";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  if (!line.includes("=") || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  const k = line.slice(0, i).trim();
  if (!process.env[k]) process.env[k] = line.slice(i + 1).trim();
}

const { verifyUserPassword } = await import("../lib/auth-users.ts");
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const user = verifyUserPassword(email, password);
console.log(user ? `OK: ${user.email}` : "FAIL: verify returned null");
