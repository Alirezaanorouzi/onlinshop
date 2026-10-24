import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = readFileSync(join(root, ".env.local"), "utf8")
  .match(/^LIARA_API_TOKEN=(.+)$/m)?.[1]
  ?.trim();
const r = spawnSync("liara", ["plan", "list", "--api-token", token], {
  encoding: "utf8",
  shell: true,
});
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
