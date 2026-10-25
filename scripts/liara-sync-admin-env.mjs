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

const phone = vars.ADMIN_PHONE?.replace(/\s+/g, "");
const email = vars.ADMIN_EMAIL?.trim();
const password = vars.ADMIN_PASSWORD;
const app =
  vars.LIARA_APP_NAME?.trim() ||
  JSON.parse(readFileSync(join(root, "liara.json"), "utf8")).app ||
  "qaim-magham";

if (!phone) {
  console.error(
    "Set ADMIN_PHONE in .env.local (no space after =), e.g. ADMIN_PHONE=09121234567",
  );
  process.exit(1);
}

const token = vars.LIARA_API_TOKEN?.trim();
const spawnEnv = { ...process.env };
if (token) spawnEnv.LIARA_API_TOKEN = token;

function liara(args) {
  const r = spawnSync(liaraCmd, args, {
    stdio: "inherit",
    shell: true,
    env: spawnEnv,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

// Subpath base URL breaks assets on Liara root domains — remove if present.
liara(["env", "unset", "NEXT_PUBLIC_BASE_PATH", "-a", app, "-f"]);

const pairs = [["ADMIN_PHONE", phone]];
if (email) pairs.push(["ADMIN_EMAIL", email]);
if (password) pairs.push(["ADMIN_PASSWORD", password]);

for (const [key, value] of pairs) {
  liara(["env", "set", `${key}=${value}`, "-a", app, "-f"]);
}

console.log(
  `Liara app "${app}" updated: unset NEXT_PUBLIC_BASE_PATH if set; set ${pairs.map(([k]) => k).join(", ")}. App will restart.`,
);
