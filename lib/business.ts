import { site } from "@/lib/site";

/**
 * اطلاعات نماد اعتماد (اینماد) — مقادیر را در `.env.local` با پیشوند NEXT_PUBLIC_ تنظیم کنید.
 * اگر مقداری خالی باشد، متن «نیاز به تکمیل» در صفحات قانونی نمایش داده می‌شود.
 */
function env(...keys: string[]): string {
  for (const key of keys) {
    const raw = process.env[key];
    if (raw === undefined) continue;
    const value = raw.trim();
    if (value) return value;
  }
  return "";
}

function required(value: string, label: string): string {
  return value || `【${label} — در .env.local تنظیم کنید】`;
}

export const business = {
  brandName: site.name,
  legalName:
    env("NEXT_PUBLIC_BUSINESS_LEGAL_NAME", "BUSINESS_LEGAL_NAME") || site.name,
  /** معرفی کوتاه برای درباره ما */
  tagline:
    env("NEXT_PUBLIC_BUSINESS_TAGLINE", "BUSINESS_TAGLINE") ||
    "فروشگاه اینترنتی پوشاک با تمرکز بر کیفیت، قیمت شفاف و پاسخ‌گویی به مشتری.",
  /** آدرس کامل پستی */
  address:
    env("NEXT_PUBLIC_BUSINESS_ADDRESS", "BUSINESS_ADDRESS") ||
    "ملایر، بلوار قائم مقام، جنب دبستان فرهنگ",
  /** تلفن تماس فروشگاه (از env؛ در لیارا MOBILE_PHONE یا ADMIN_PHONE) */
  phoneMobile:
    env(
      "NEXT_PUBLIC_BUSINESS_PHONE_MOBILE",
      "MOBILE_PHONE",
      "ADMIN_PHONE",
    ) || required("", "موبایل تماس"),
  email:
    env("NEXT_PUBLIC_BUSINESS_EMAIL", "EMAIL", "BUSINESS_EMAIL") ||
    "noruzimoji69@gmail.com",
  /** مثال: شنبه تا چهارشنبه ۱۰ تا ۲۰ — پنج‌شنبه ۱۰ تا ۱۴ */
  hours:
    env("NEXT_PUBLIC_BUSINESS_HOURS", "BUSINESS_HOURS") ||
    "شنبه تا چهارشنبه ۱۰:۰۰ تا ۲۰:۰۰ — پنج‌شنبه ۱۰:۰۰ تا ۱۴:۰۰",
  /** کد پستی */
  postalCode: env("NEXT_PUBLIC_BUSINESS_POSTAL_CODE", "BUSINESS_POSTAL_CODE") ||
    "",
  /** استان و شهر */
  city: env("NEXT_PUBLIC_BUSINESS_CITY", "BUSINESS_CITY") || "",
  /** نحوه ارسال پیش‌فرض */
  defaultShipping:
    env("NEXT_PUBLIC_BUSINESS_SHIPPING", "BUSINESS_SHIPPING") ||
    "ارسال با پست پیشتاز یا تیپاکس (هزینه بر اساس وزن و مقصد محاسبه می‌شود).",
  /** اطلاعات پیش‌پرداخت / پرداخت */
  paymentInfo:
    env("NEXT_PUBLIC_BUSINESS_PAYMENT_INFO", "BUSINESS_PAYMENT_INFO") ||
    "پس از ثبت سفارش، مبلغ نهایی (شامل ارسال در صورت لزوم) از طریق تماس یا پیامک اعلام می‌شود. پرداخت از طریق درگاه بانکی امن یا کارت‌به‌کارت پس از تأیید موجودی انجام می‌شود.",
  /** لینک اینستاگرام یا شبکه اجتماعی (اختیاری) */
  instagram: env("NEXT_PUBLIC_BUSINESS_INSTAGRAM", "BUSINESS_INSTAGRAM") || "",
};

export function hasCompleteContactInfo(): boolean {
  return (
    Boolean(business.address.trim()) &&
    !business.phoneMobile.includes("【") &&
    !business.email.includes("【")
  );
}
