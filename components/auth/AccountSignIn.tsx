"use client";

import Link from "next/link";
import { CustomerOtpForm } from "@/components/auth/CustomerOtpForm";

type AccountSignInProps = {
  redirectTo?: string;
  title?: string;
};

export function AccountSignIn({
  redirectTo = "/account",
  title = "ورود / ثبت‌نام",
}: AccountSignInProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-center text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-center text-sm text-muted leading-7">
        با شماره موبایل و کد یک‌بارمصرف وارد شوید. مدیر فروشگاه هم از همین
        صفحه با شمارهٔ تنظیم‌شده در سیستم وارد می‌شود.
      </p>

      <div className="mt-8">
        <CustomerOtpForm redirectTo={redirectTo} />
      </div>

      <Link
        href="/collection/men"
        className="mt-10 block text-center text-sm text-gold hover:underline"
      >
        بازگشت به فروشگاه
      </Link>
    </div>
  );
}
