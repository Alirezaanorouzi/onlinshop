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

function normalizeSnappBaseUrl(raw) {
  let base = (raw || "https://api.snapppay.ir").trim().replace(/\/+$/, "");
  if (base.endsWith("/v1")) base = base.slice(0, -3);
  return base;
}

const clientId = vars.SNAPPPAY_CLIENT_ID?.trim();
const clientSecret = vars.SNAPPPAY_CLIENT_SECRET?.trim();
const username = vars.SNAPPPAY_USERNAME?.trim();
const password = vars.SNAPPPAY_PASSWORD?.trim();

if (!clientId || !clientSecret || !username || !password) {
  console.error(
    "Set SNAPPPAY_CLIENT_ID, SNAPPPAY_CLIENT_SECRET, SNAPPPAY_USERNAME, and SNAPPPAY_PASSWORD in .env.local first.",
  );
  process.exit(1);
}

const siteUrl =
  vars.SITE_URL?.replace(/\/$/, "") ||
  vars.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "";

const pairs = [
  ["SNAPPPAY_CLIENT_ID", clientId],
  ["SNAPPPAY_CLIENT_SECRET", clientSecret],
  ["SNAPPPAY_USERNAME", username],
  ["SNAPPPAY_PASSWORD", password],
  [
    "SNAPPPAY_BASE_URL",
    normalizeSnappBaseUrl(vars.SNAPPPAY_BASE_URL),
  ],
];

if (siteUrl) {
  pairs.push(["SITE_URL", siteUrl]);
}

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
