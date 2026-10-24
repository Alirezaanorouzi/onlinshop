import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = join(root, ".env.local");
if (!existsSync(envFile)) {
  console.error("Missing .env.local with ADMIN_EMAIL and ADMIN_PASSWORD");
  process.exit(1);
}

const vars = {};
for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const i = line.indexOf("=");
  vars[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

const email = vars.ADMIN_EMAIL;
const password = vars.ADMIN_PASSWORD;
if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

const app = vars.LIARA_APP_NAME || "qaim-magham";
const cmd = `npm run db:migrate && ADMIN_EMAIL=${JSON.stringify(email)} ADMIN_PASSWORD=${JSON.stringify(password)} npm run db:seed-admin`;

console.log(`Running migrate + db:seed-admin on Liara app ${app}…`);
const r = spawnSync("liara", ["app", "shell", "-a", app, "-c", cmd], {
  stdio: "inherit",
  shell: true,
});
process.exit(r.status ?? 1);
