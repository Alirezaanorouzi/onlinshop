import "server-only";

import { normalizeIranMobile } from "@/lib/phone-ir";

export type KavenegarLookupResult =
  | { ok: true; messageId?: number }
  | { ok: false; error: string };

function getKavenegarConfig() {
  const apiKey = process.env.KAVENEGAR_API_KEY?.trim();
  const template =
    process.env.KAVENEGAR_VERIFY_TEMPLATE?.trim() || "loginotp";
  return { apiKey, template };
}

/** Send OTP via Kavenegar Verify Lookup (pre-approved template). */
export async function sendLoginOtpSms(
  phone: string,
  code: string,
): Promise<KavenegarLookupResult> {
  const { apiKey, template } = getKavenegarConfig();
  if (!apiKey) {
    return { ok: false, error: "سرویس پیامک پیکربندی نشده است." };
  }

  const receptor = normalizeIranMobile(phone);
  if (!receptor) {
    return { ok: false, error: "شماره موبایل نامعتبر است." };
  }

  const url = new URL(
    `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`,
  );
  url.searchParams.set("receptor", receptor);
  url.searchParams.set("token", code);
  url.searchParams.set("template", template);
  url.searchParams.set("type", "sms");

  try {
    const res = await fetch(url.toString(), { method: "GET" });
    const data = (await res.json()) as {
      return?: { status?: number; message?: string };
      entries?: Array<{ messageid?: number }>;
    };

    const status = data.return?.status;
    if (!res.ok || status !== 200) {
      const msg = data.return?.message?.trim();
      return {
        ok: false,
        error: msg || "ارسال پیامک ناموفق بود. بعداً دوباره تلاش کنید.",
      };
    }

    return { ok: true, messageId: data.entries?.[0]?.messageid };
  } catch {
    return { ok: false, error: "اتصال به سرویس پیامک برقرار نشد." };
  }
}
