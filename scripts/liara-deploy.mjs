import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readEnvLocal(key) {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return undefined;
  const line = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${key}=`));
  return line?.slice(key.length + 1).trim();
}

const deployOnly = process.argv.includes("--deploy-only");
const appName = process.env.LIARA_APP_NAME || "qaim-magham";
const network = process.env.LIARA_NETWORK || readEnvLocal("LIARA_NETWORK") || "my-network";
const plan = process.env.LIARA_PLAN || readEnvLocal("LIARA_PLAN") || "medium-g2";
const featurePlan =
  process.env.LIARA_FEATURE_PLAN || readEnvLocal("LIARA_FEATURE_PLAN") || "basic";
const token = process.env.LIARA_API_TOKEN || readEnvLocal("LIARA_API_TOKEN");
const adminToken = process.env.ADMIN_TOKEN || readEnvLocal("ADMIN_TOKEN");

if (!token) {
  console.error("Missing LIARA_API_TOKEN in .env.local");
  process.exit(1);
}

function liara(...args) {
  const r = spawnSync("liara", [...args, "--api-token", token], {
    cwd: root,
    encoding: "utf8",
    shell: true,
    maxBuffer: 20 * 1024 * 1024,
  });
  const out = (r.stdout || "") + (r.stderr || "");
  if (out.trim()) process.stdout.write(out);
  return { status: r.status ?? 1, out };
}

console.log("Auth check...");
const me = await fetch("https://api.liara.ir/v1/me", {
  headers: { Authorization: `Bearer ${token}` },
});
if (!me.ok) {
  console.error("Liara auth failed:", me.status, await me.text());
  console.error(
    "Use a token from https://console.liara.ir/API (tokens expire; create a new one if needed).",
  );
  process.exit(1);
}
const { user } = await me.json();
console.log("Logged in as:", user?.email ?? user?.fullname ?? "ok");

if (!deployOnly) {
console.log(
  "\nCreate app",
  appName,
  "network:",
  network,
  "plan:",
  plan,
  "feature:",
  featurePlan,
);
const created = liara(
  "app",
  "create",
  "-a",
  appName,
  "--platform",
  "next",
  "-n",
  network,
  "--plan",
  plan,
  "--feature-plan",
  featurePlan,
);
if (created.status !== 0 && !/already exists/i.test(created.out)) {
  console.error("App create failed. Fix errors above (balance, plan, name).");
  process.exit(created.status);
}

console.log("\nDisks");
liara("disk", "create", "-a", appName, "-n", "shop-data", "-s", "1");
liara("disk", "create", "-a", appName, "-n", "shop-uploads", "-s", "4");
}

console.log("\nEnv");
liara("env", "set", "CATALOG_BACKEND=sqlite", "-a", appName, "-f");
liara("env", "set", "SQLITE_PATH=data/catalog.sqlite", "-a", appName, "-f");
if (adminToken) {
  liara("env", "set", `ADMIN_TOKEN=${adminToken}`, "-a", appName, "-f");
} else {
  console.warn("No ADMIN_TOKEN in .env.local — set on Liara console.");
}

console.log("\nDeploy (may take several minutes)...");
const deploy = liara("deploy", "-a", appName, "-p", "3000");
if (deploy.status !== 0) {
  process.exit(deploy.status);
}

console.log("\nDone. Run once in Liara shell: npm run db:seed");
console.log(`https://${appName}.liara.run`);
