import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = readFileSync(join(root, ".env.local"), "utf8")
  .match(/^LIARA_API_TOKEN=(.+)$/m)?.[1]
  ?.trim();
const app = process.argv[2] || "qaim-magham";

function run(...args) {
  const r = spawnSync("liara", [...args, "--api-token", token], {
    encoding: "utf8",
    shell: true,
    maxBuffer: 10 * 1024 * 1024,
  });
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  return r.status;
}

console.log("=== Apps ===");
run("app", "list");
console.log("\n=== Logs (last) ===");
run("app", "logs", "-a", app);
