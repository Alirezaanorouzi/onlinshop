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

const app = vars.LIARA_APP_NAME || "qaim-magham";
const token = vars.TELEGRAM_BOT_TOKEN?.trim();
const chatId =
  vars.TELEGRAM_CHAT_ID?.trim() || vars.CHANNEL_ID?.trim();

if (!token || !chatId) {
  console.error(
    "Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (or CHANNEL_ID) in .env.local",
  );
  process.exit(1);
}

const tokenEnv = vars.LIARA_API_TOKEN?.trim();
const spawnEnv = { ...process.env };
if (tokenEnv) spawnEnv.LIARA_API_TOKEN = tokenEnv;

function liara(args) {
  const r = spawnSync(liaraCmd, args, {
    stdio: "inherit",
    shell: true,
    env: spawnEnv,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const pairs = [
  ["TELEGRAM_BOT_TOKEN", token],
  ["TELEGRAM_CHAT_ID", chatId],
  ["TELEGRAM_NOTIFY_ENABLED", vars.TELEGRAM_NOTIFY_ENABLED?.trim() || "true"],
];

for (const [key, value] of pairs) {
  liara(["env", "set", `${key}=${value}`, "-a", app, "-f"]);
}

console.log(`Liara env updated (${pairs.map(([k]) => k).join(", ")}).`);
