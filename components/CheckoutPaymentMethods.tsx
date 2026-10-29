"use client";

import { useEffect, useMemo, useState } from "react";
import { apiPath } from "@/lib/api-path";
import {
  CHECKOUT_LINES_STORAGE_KEY,
  CHECKOUT_SNAPPPAY_TOKEN_KEY,
  cartLineKey,
} from "@/lib/cart-line-key";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/types";

const MIN_TOMANS = 100;

type PaymentMethod = "zarinpal" | "snapppay";

function ZarinpalLogo({ className }: { className?: string }) {
  return (
    <div
      className={`grid place-items-center rounded-lg bg-[#ffc107] text-lg font-bold text-[#1a1a1a] ${className ?? ""}`}
      aria-hidden
    >
      Z
    </div>
  );
}

function SnappPayLogo({ className }: { className?: string }) {
  return (
    <div
      className={`grid place-items-center rounded-lg bg-[#0088d4] px-1.5 text-[10px] font-bold leading-tight text-white ${className ?? ""}`}
      aria-hidden
    >
      <span>
        Snapp!
        <br />
        Pay
      </span>
    </div>
  );
}

function profileErrorLink(error: string) {
  return (
    error.includes("حساب کاربری") ||
    error.includes("آدرس") ||
    error.includes("کد پستی")
  );
}

export function CheckoutPaymentMethods({
  lines,
  totalTomans,
  cartReady,
  productsLoading,
  zarinpalEnabled,
  snapppayEnabled,
}: {
  lines: CartLine[];
  totalTomans: number;
  cartReady: boolean;
  productsLoading: boolean;
  zarinpalEnabled: boolean;
  snapppayEnabled: boolean;
}) {
  const [method, setMethod] = useState<PaymentMethod>("zarinpal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snappEligible, setSnappEligible] = useState<boolean | null>(null);
  const [snappChecking, setSnappChecking] = useState(false);

  const belowMin = totalTomans < MIN_TOMANS;
  const showSnapp = snapppayEnabled && snappEligible === true;
  const monthlyInstallment = Math.ceil(totalTomans / 4);

  const availableMethods = useMemo(() => {
    const list: PaymentMethod[] = [];
    if (zarinpalEnabled) list.push("zarinpal");
    if (showSnapp) list.push("snapppay");
    return list;
  }, [zarinpalEnabled, showSnapp]);

  useEffect(() => {
    if (availableMethods.length === 0) return;
    if (!availableMethods.includes(method)) {
      setMethod(availableMethods[0] ?? "zarinpal");
    }
  }, [availableMethods, method]);

  useEffect(() => {
    if (!snapppayEnabled || !cartReady || belowMin) {
      setSnappEligible(false);
      setSnappChecking(false);
      return;
    }
    let cancelled = false;
    setSnappChecking(true);
    fetch(
      apiPath(
        `/api/payment/snapppay/eligible?amountTomans=${encodeURIComponent(String(totalTomans))}`,
      ),
    )
      .then((response) => response.json())
      .then((data: { eligible?: boolean }) => {
        if (!cancelled) setSnappEligible(Boolean(data.eligible));
      })
      .catch(() => {
        if (!cancelled) setSnappEligible(false);
      })
      .finally(() => {
        if (!cancelled) setSnappChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [snapppayEnabled, cartReady, belowMin, totalTomans]);

  const canPay =
    cartReady &&
    !belowMin &&
    lines.length > 0 &&
    !busy &&
    !productsLoading &&
    availableMethods.length > 0 &&
    availableMethods.includes(method) &&
    !(method === "snapppay" && snappChecking);

  async function payZarinpal() {
    const response = await fetch(apiPath("/api/payment/zarinpal/request"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    });
    const data = (await response.json()) as {
      redirectUrl?: string;
      error?: string;
    };
    if (!response.ok || !data.redirectUrl) {
      throw new Error(data.error ?? "شروع پرداخت ناموفق بود");
    }
    sessionStorage.setItem(
      CHECKOUT_LINES_STORAGE_KEY,
      JSON.stringify(lines.map((line) => cartLineKey(line))),
    );
    window.location.assign(data.redirectUrl);
  }

  async function paySnappPay() {
    const response = await fetch(apiPath("/api/payment/snapppay/request"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    });
    const data = (await response.json()) as {
      redirectUrl?: string;
      paymentToken?: string;
      error?: string;
    };
    if (!response.ok || !data.redirectUrl || !data.paymentToken) {
      throw new Error(data.error ?? "شروع پرداخت ناموفق بود");
    }
    sessionStorage.setItem(
      CHECKOUT_LINES_STORAGE_KEY,
      JSON.stringify(lines.map((line) => cartLineKey(line))),
    );
    sessionStorage.setItem(CHECKOUT_SNAPPPAY_TOKEN_KEY, data.paymentToken);
    window.location.assign(data.redirectUrl);
  }

  async function pay() {
    if (belowMin) {
      setError(`حداقل مبلغ سفارش ${formatPrice(MIN_TOMANS)} است`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (method === "snapppay") await paySnappPay();
      else await payZarinpal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای پرداخت");
      setBusy(false);
    }
  }

  if (availableMethods.length === 0) {
    if (snapppayEnabled && snappChecking) {
      return (
        <p className="text-sm text-muted">در حال بررسی روش‌های پرداخت…</p>
      );
    }
    if (zarinpalEnabled) {
      return (
        <p className="text-sm text-muted">
          درگاه پرداخت در دسترس نیست. بعداً دوباره تلاش کنید.
        </p>
      );
    }
    return null;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-cream">روش پرداخت</h2>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-gold" aria-hidden />
      </div>

      <div
        className="overflow-hidden rounded-xl border border-white/10 bg-surface/30"
        role="radiogroup"
        aria-label="روش پرداخت"
      >
        {zarinpalEnabled && (
          <label
            className={`flex cursor-pointer items-center gap-4 border-b border-white/10 px-4 py-4 transition-colors ${
              method === "zarinpal" ? "bg-gold/5" : "hover:bg-white/[0.03]"
            }`}
          >
            <input
              type="radio"
              name="checkout-payment-method"
              value="zarinpal"
              checked={method === "zarinpal"}
              onChange={() => setMethod("zarinpal")}
              className="size-5 shrink-0 accent-gold"
            />
            <div className="min-w-0 flex-1 text-right">
              <p className="text-sm font-medium text-cream">پرداخت آنلاین</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                پرداخت امن به وسیلهٔ کلیهٔ کارت‌های بانکی عضو شتاب
              </p>
            </div>
            <ZarinpalLogo className="size-12 shrink-0" />
          </label>
        )}

        {showSnapp && (
          <label
            className={`flex cursor-pointer items-center gap-4 px-4 py-4 transition-colors ${
              method === "snapppay" ? "bg-gold/5" : "hover:bg-white/[0.03]"
            }`}
          >
            <input
              type="radio"
              name="checkout-payment-method"
              value="snapppay"
              checked={method === "snapppay"}
              onChange={() => setMethod("snapppay")}
              className="size-5 shrink-0 accent-gold"
            />
            <div className="min-w-0 flex-1 text-right">
              <p className="text-sm font-medium text-cream">
                پرداخت اقساطی اسنپ‌پی
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                ۴ قسط ماهانه {formatPrice(monthlyInstallment)} (بدون کارمزد)
              </p>
            </div>
            <SnappPayLogo className="size-12 shrink-0" />
          </label>
        )}
      </div>

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
          {profileErrorLink(error) && (
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
        className="w-full rounded-lg bg-gold py-3.5 text-sm font-medium text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[14rem] sm:px-10"
      >
        {busy
          ? method === "snapppay"
            ? "در حال انتقال به اسنپ‌پی…"
            : "در حال انتقال به درگاه…"
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
