import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const line = readFileSync(envPath, "utf8")
  .split(/\r?\n/)
  .find((l) => l.startsWith("LIARA_API_TOKEN="));
if (!line) {
  console.error("No LIARA_API_TOKEN in .env.local");
  process.exit(1);
}
const token = line.slice("LIARA_API_TOKEN=".length).trim();
const res = await fetch("https://api.liara.ir/v1/me", {
  headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) {
  console.error("Auth failed:", res.status, await res.text());
  process.exit(1);
}
const data = await res.json();
console.log("OK:", data.user?.email ?? "authenticated");
