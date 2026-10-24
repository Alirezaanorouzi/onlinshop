import "server-only";

import { createHmac, randomInt } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { otpVerifications } from "@/db/schema";
import { sendLoginOtpSms } from "@/lib/kavenegar";
import { normalizeIranMobile } from "@/lib/phone-ir";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

function otpPepper(): string {
  return (
    process.env.OTP_PEPPER?.trim() ||
    process.env.KAVENEGAR_API_KEY?.trim() ||
    "dev-otp-pepper"
  );
}

function hashOtpCode(phone: string, code: string): string {
  return createHmac("sha256", otpPepper())
    .update(`${phone}:${code}`)
    .digest("hex");
}

function generateOtpCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export type OtpSendResult =
  | { ok: true }
  | { ok: false; error: string; retryAfterSeconds?: number };

function storeOtpForPhone(phone: string, code: string, now: number) {
  const db = getDb();
  const expiresAt = new Date(now + OTP_TTL_MS);
  const codeHash = hashOtpCode(phone, code);

  db.insert(otpVerifications)
    .values({
      phone,
      codeHash,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(now),
    })
    .onConflictDoUpdate({
      target: otpVerifications.phone,
      set: {
        codeHash,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(now),
      },
    })
    .run();
}

export async function sendOtpToPhone(rawPhone: string): Promise<OtpSendResult> {
  const phone = normalizeIranMobile(rawPhone);
  if (!phone) {
    return { ok: false, error: "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۱۲۳۴۵۶۷)." };
  }

  const db = getDb();
  const now = Date.now();
  const existing = db
    .select()
    .from(otpVerifications)
    .where(eq(otpVerifications.phone, phone))
    .get();

  if (existing && now - existing.lastSentAt.getTime() < RESEND_COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil(
      (RESEND_COOLDOWN_MS - (now - existing.lastSentAt.getTime())) / 1000,
    );
    return {
      ok: false,
      error: `لطفاً ${retryAfterSeconds} ثانیه دیگر دوباره درخواست کد دهید.`,
      retryAfterSeconds,
    };
  }

  const code = generateOtpCode();
  storeOtpForPhone(phone, code, now);

  const sent = await sendLoginOtpSms(phone, code);
  if (!sent.ok) return { ok: false, error: sent.error };

  return { ok: true };
}

export type OtpVerifyResult =
  | { ok: true; phone: string }
  | { ok: false; error: string };

export function verifyOtpCode(rawPhone: string, rawCode: string): OtpVerifyResult {
  const phone = normalizeIranMobile(rawPhone);
  if (!phone) {
    return { ok: false, error: "شماره موبایل معتبر نیست." };
  }

  const code = rawCode.replace(/\s/g, "").trim();
  if (!/^\d{5,6}$/.test(code)) {
    return { ok: false, error: "کد تأیید را کامل وارد کنید." };
  }

  const db = getDb();
  const row = db
    .select()
    .from(otpVerifications)
    .where(eq(otpVerifications.phone, phone))
    .get();

  if (!row) {
    return { ok: false, error: "ابتدا درخواست ارسال کد دهید." };
  }

  if (row.expiresAt.getTime() < Date.now()) {
    db.delete(otpVerifications).where(eq(otpVerifications.phone, phone)).run();
    return { ok: false, error: "کد منقضی شده است. دوباره درخواست ارسال کنید." };
  }

  if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
    return {
      ok: false,
      error: "تعداد تلاش‌ها زیاد است. دوباره درخواست ارسال کد دهید.",
    };
  }

  const matches = hashOtpCode(phone, code) === row.codeHash;
  if (!matches) {
    db.update(otpVerifications)
      .set({ attempts: row.attempts + 1 })
      .where(eq(otpVerifications.phone, phone))
      .run();
    return { ok: false, error: "کد تأیید اشتباه است." };
  }

  db.delete(otpVerifications).where(eq(otpVerifications.phone, phone)).run();
  return { ok: true, phone };
}
