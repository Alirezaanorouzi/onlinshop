import "server-only";

export function getTelegramChatId(): string | null {
  return (
    process.env.TELEGRAM_CHAT_ID?.trim() ||
    process.env.CHANNEL_ID?.trim() ||
    null
  );
}

export function isTelegramNotifyEnabled(): boolean {
  if (process.env.TELEGRAM_NOTIFY_ENABLED === "false") return false;
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = getTelegramChatId();
  return Boolean(token && chatId);
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = getTelegramChatId();
  if (!token || !chatId) {
    throw new Error("Telegram bot token or chat id not configured");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API ${response.status}: ${body}`);
  }
}
