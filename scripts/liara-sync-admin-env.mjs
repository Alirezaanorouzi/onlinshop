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
  vars[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

const phone = vars.ADMIN_PHONE;
const email = vars.ADMIN_EMAIL;
const password = vars.ADMIN_PASSWORD;
const app = vars.LIARA_APP_NAME || "qaim-magham";

if (!phone) {
  console.error("Set ADMIN_PHONE in .env.local (store owner mobile for OTP admin login).");
  process.exit(1);
}

const pairs = [["ADMIN_PHONE", phone]];
if (email) pairs.push(["ADMIN_EMAIL", email]);
if (password) pairs.push(["ADMIN_PASSWORD", password]);

for (const [key, value] of pairs) {
  const r = spawnSync(
    liaraCmd,
    ["env", "set", `${key}=${value}`, "-a", app, "-f"],
    { stdio: "inherit", shell: true },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log(
  `Liara env updated (${pairs.map(([k]) => k).join(", ")}). Restart the app.`,
);
