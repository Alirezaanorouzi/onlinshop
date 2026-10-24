"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiPath } from "@/lib/api-path";
import {
  CHECKOUT_LINES_STORAGE_KEY,
  parseCartLineKey,
} from "@/lib/cart-line-key";
import { removeCartLinesFromStorage } from "@/lib/cart";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<
    "loading" | "success" | "cancelled" | "error"
  >("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const status = searchParams.get("Status");
    const authority = searchParams.get("Authority");

    if (status !== "OK" || !authority) {
      setState(status === "OK" ? "error" : "cancelled");
      setMessage(
        status === "OK"
          ? "کد تراکنش دریافت نشد."
          : "پرداخت توسط شما لغو شد یا ناموفق بود.",
      );
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(apiPath("/api/payment/zarinpal/verify"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authority }),
        });
        const data = (await response.json()) as {
          ok?: boolean;
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok || !data.ok) {
          setState("error");
          setMessage(data.error ?? "تأیید پرداخت ناموفق بود");
          return;
        }

        const raw = sessionStorage.getItem(CHECKOUT_LINES_STORAGE_KEY);
        if (raw) {
          try {
            const keys = JSON.parse(raw) as string[];
            const lines = keys
              .map((key) => parseCartLineKey(key))
              .filter((line): line is NonNullable<typeof line> => line !== null);
            removeCartLinesFromStorage(lines);
          } catch {
            /* ignore */
          }
          sessionStorage.removeItem(CHECKOUT_LINES_STORAGE_KEY);
        }

        router.replace("/account?order=success");
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("اتصال به سرور برقرار نشد.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {state === "loading" && (
        <p className="text-muted">در حال تأیید پرداخت…</p>
      )}
      {state === "cancelled" && (
        <>
          <h1 className="text-2xl font-semibold">پرداخت انجام نشد</h1>
          <p className="mt-4 text-sm text-muted">{message}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/cart/checkout"
              className="inline-block border border-gold px-6 py-3 text-sm text-gold"
            >
              بازگشت به پرداخت
            </Link>
            <Link
              href="/cart"
              className="inline-block border border-white/15 px-6 py-3 text-sm text-muted hover:text-cream"
            >
              سبد خرید
            </Link>
          </div>
        </>
      )}
      {state === "error" && (
        <>
          <h1 className="text-2xl font-semibold text-red-300">خطا</h1>
          <p className="mt-4 text-sm text-muted">{message}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/cart/checkout"
              className="inline-block border border-gold px-6 py-3 text-sm text-gold"
            >
              تلاش دوباره
            </Link>
            <Link
              href="/account"
              className="inline-block border border-white/15 px-6 py-3 text-sm text-muted hover:text-cream"
            >
              حساب کاربری
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-20 text-center text-muted">در حال بارگذاری…</p>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
