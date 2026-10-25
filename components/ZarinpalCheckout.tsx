"use client";

import { useState } from "react";
import { apiPath } from "@/lib/api-path";
import {
  CHECKOUT_LINES_STORAGE_KEY,
  cartLineKey,
} from "@/lib/cart-line-key";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/types";

const MIN_TOMANS = 100;

export function ZarinpalCheckout({
  lines,
  totalTomans,
  cartReady,
  productsLoading = false,
}: {
  lines: CartLine[];
  totalTomans: number;
  cartReady: boolean;
  productsLoading?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const belowMin = totalTomans < MIN_TOMANS;
  const canPay =
    cartReady && !belowMin && lines.length > 0 && !busy && !productsLoading;

  async function pay() {
    if (belowMin) {
      setError(`حداقل مبلغ سفارش ${formatPrice(MIN_TOMANS)} است`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch(apiPath("/api/payment/zarinpal/request"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = (await response.json()) as {
        redirectUrl?: string;
        error?: string;
        code?: string;
      };
      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error ?? "شروع پرداخت ناموفق بود");
      }
      sessionStorage.setItem(
        CHECKOUT_LINES_STORAGE_KEY,
        JSON.stringify(lines.map((line) => cartLineKey(line))),
      );
      window.location.assign(data.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای پرداخت");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {belowMin && cartReady && (
        <p className="text-xs text-muted">
          حداقل مبلغ پرداخت آنلاین {formatPrice(MIN_TOMANS)} است.
        </p>
      )}

      {error && (
        <p
          className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {error}
          {(error.includes("حساب کاربری") ||
            error.includes("آدرس") ||
            error.includes("کد پستی")) && (
            <a
              href="/account?complete=1&next=%2Fcart%2Fcheckout"
              className="mt-2 block text-gold hover:underline"
            >
              تکمیل اطلاعات کاربری
            </a>
          )}
        </p>
      )}

      <button
        type="button"
        disabled={!canPay}
        onClick={() => void pay()}
        className="w-full rounded-lg bg-gold py-3.5 text-sm font-medium text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[12rem] sm:px-10"
      >
        {busy
          ? "در حال انتقال به درگاه…"
          : productsLoading
            ? "در حال بارگذاری…"
            : `پرداخت ${formatPrice(totalTomans)}`}
      </button>

      <p className="text-xs leading-6 text-muted">
        پس از پرداخت موفق به حساب کاربری برمی‌گردید و وضعیت سفارش را می‌بینید.
      </p>
    </div>
  );
}
