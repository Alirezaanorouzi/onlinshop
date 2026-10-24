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
const merchantId = vars.ZARINPAL_MERCHANT_ID;
const siteUrl =
  vars.SITE_URL?.replace(/\/$/, "") ||
  vars.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://ghaemmaghamp.ir";

if (!merchantId) {
  console.error("Set ZARINPAL_MERCHANT_ID in .env.local");
  process.exit(1);
}

const pairs = [
  ["ZARINPAL_MERCHANT_ID", merchantId],
  ["SITE_URL", siteUrl],
  ["ENAMAD_REFERER", vars.ENAMAD_REFERER?.replace(/\/$/, "") || siteUrl],
];

for (const key of [
  "ENAMAD_EMBED",
  "INAMAD_LOGO",
  "ENAMAD_ID",
  "ENAMAD_CODE",
  "ENAMAD_TRUST_URL",
  "ENAMAD_LOGO_URL",
]) {
  if (vars[key]) pairs.push([key, vars[key]]);
}

if (vars.ZARINPAL_ACCESS_TOKEN) {
  pairs.push(["ZARINPAL_ACCESS_TOKEN", vars.ZARINPAL_ACCESS_TOKEN]);
}
if (vars.ZARINPAL_SANDBOX) {
  pairs.push(["ZARINPAL_SANDBOX", vars.ZARINPAL_SANDBOX]);
}
if (vars.KAVENEGAR_API_KEY) {
  pairs.push(["KAVENEGAR_API_KEY", vars.KAVENEGAR_API_KEY]);
}
if (vars.KAVENEGAR_VERIFY_TEMPLATE) {
  pairs.push(["KAVENEGAR_VERIFY_TEMPLATE", vars.KAVENEGAR_VERIFY_TEMPLATE]);
} else if (vars.KAVENEGAR_API_KEY) {
  pairs.push(["KAVENEGAR_VERIFY_TEMPLATE", "loginotp"]);
}

for (const [key, value] of pairs) {
  const r = spawnSync(
    liaraCmd,
    ["env", "set", `${key}=${value}`, "-a", app, "-f"],
    { cwd: root, stdio: "inherit", shell: false },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log(
  `Liara env updated (${pairs.map(([k]) => k).join(", ")}). Restart or redeploy the app.`,
);
