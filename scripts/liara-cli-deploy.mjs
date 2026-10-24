import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const token = readFileSync(envPath, "utf8")
  .match(/^LIARA_API_TOKEN=(.+)$/m)?.[1]
  ?.trim();
if (!token) {
  console.error("Missing LIARA_API_TOKEN in .env.local");
  process.exit(1);
}

const app = process.env.LIARA_APP_NAME || "qaim-magham";
console.log(`Deploying ${app} via Liara CLI…`);

const result = spawnSync(
  "liara",
  ["deploy", "-a", app, "-p", "3000", "--api-token", token],
  { cwd: root, stdio: "inherit", shell: true },
);

process.exit(result.status ?? 1);
