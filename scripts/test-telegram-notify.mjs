/**
 * Send a test message using TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (or CHANNEL_ID) from .env.local
 * Usage: node scripts/test-telegram-notify.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

const token = vars.TELEGRAM_BOT_TOKEN?.trim();
const chatId =
  vars.TELEGRAM_CHAT_ID?.trim() || vars.CHANNEL_ID?.trim();

if (!token || !chatId) {
  console.error("Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (or CHANNEL_ID)");
  process.exit(1);
}

const response = await fetch(
  `https://api.telegram.org/bot${token}/sendMessage`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "✅ تست اعلان سفارش — قائم مقام\nاگر این پیام را می‌بینید، تنظیمات تلگرام درست است.",
    }),
  },
);

const body = await response.text();
if (!response.ok) {
  console.error("Telegram error:", body);
  process.exit(1);
}

console.log("Test message sent. Check your Telegram channel.");
