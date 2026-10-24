import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";

const liaraCmd = platform() === "win32" ? "liara.cmd" : "liara";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = join(root, ".env.local");
if (!existsSync(envFile)) {
  console.error("Missing .env.local");
  process.exit(1);
}

const vars = {};
for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const i = line.indexOf("=");
  const key = line.slice(0, i).trim();
  let value = line.slice(i + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  vars[key] = value;
}

const app = vars.LIARA_APP_NAME || "qaim-magham";
const apiKey = vars.KAVENEGAR_API_KEY?.trim();
const template = vars.KAVENEGAR_VERIFY_TEMPLATE?.trim() || "loginotp";

if (!apiKey) {
  console.error("Set KAVENEGAR_API_KEY in .env.local first.");
  process.exit(1);
}

const pairs = [
  ["KAVENEGAR_API_KEY", apiKey],
  ["KAVENEGAR_VERIFY_TEMPLATE", template],
];

for (const [key, value] of pairs) {
  const r = spawnSync(
    liaraCmd,
    ["env", "set", `${key}=${value}`, "-a", app, "-f"],
    { cwd: root, stdio: "inherit", shell: true },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log(
  `Liara env updated (${pairs.map(([k]) => k).join(", ")}). Restart the app from the console or run: liara restart -a ${app}`,
);
