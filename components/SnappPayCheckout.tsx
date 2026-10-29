"use client";

import { useEffect, useState } from "react";
import { apiPath } from "@/lib/api-path";
import {
  CHECKOUT_LINES_STORAGE_KEY,
  CHECKOUT_SNAPPPAY_TOKEN_KEY,
  cartLineKey,
} from "@/lib/cart-line-key";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/types";

const MIN_TOMANS = 100;

export function SnappPayCheckout({
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
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [promoTitle, setPromoTitle] = useState<string | null>(null);
  const [promoDescription, setPromoDescription] = useState<string | null>(
    null,
  );

  const belowMin = totalTomans < MIN_TOMANS;
  const canPay =
    cartReady &&
    !belowMin &&
    lines.length > 0 &&
    !busy &&
    !productsLoading &&
    eligible === true;

  useEffect(() => {
    if (!cartReady || belowMin || totalTomans < MIN_TOMANS) {
      setEligible(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(
          apiPath(
            `/api/payment/snapppay/eligible?amountTomans=${encodeURIComponent(String(totalTomans))}`,
          ),
        );
        const data = (await response.json()) as {
          eligible?: boolean;
          titleMessage?: string;
          description?: string;
        };
        if (cancelled) return;
        setEligible(Boolean(data.eligible));
        setPromoTitle(data.titleMessage ?? null);
        setPromoDescription(data.description ?? null);
      } catch {
        if (!cancelled) setEligible(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cartReady, belowMin, totalTomans]);

  async function pay() {
    if (belowMin) {
      setError(`حداقل مبلغ سفارش ${formatPrice(MIN_TOMANS)} است`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای پرداخت");
      setBusy(false);
    }
  }

  if (eligible === false && !error) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
      {(promoTitle || promoDescription) && (
        <div className="rounded-lg border border-white/10 bg-ink/40 px-3 py-2 text-xs leading-6 text-muted">
          {promoTitle && (
            <p className="font-medium text-cream">{promoTitle}</p>
          )}
          {promoDescription && <p>{promoDescription}</p>}
        </div>
      )}

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
        className="w-full rounded-lg border border-gold/60 bg-transparent py-3.5 text-sm font-medium text-gold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[12rem] sm:px-10"
      >
        {busy
          ? "در حال انتقال به اسنپ‌پی…"
          : productsLoading || eligible === null
            ? "در حال بررسی اسنپ‌پی…"
            : `پرداخت اقساطی ${formatPrice(totalTomans)}`}
      </button>

      <p className="text-xs leading-6 text-muted">
        پرداخت در ۴ قسط ماهانه از طریق اسنپ‌پی. پس از پرداخت موفق به حساب
        کاربری برمی‌گردید.
      </p>
    </div>
  );
}
