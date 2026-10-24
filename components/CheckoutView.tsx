"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ZarinpalCheckout } from "@/components/ZarinpalCheckout";
import { apiPath } from "@/lib/api-path";
import {
  CHECKOUT_LINES_STORAGE_KEY,
  cartLineKey,
} from "@/lib/cart-line-key";
import { useCart } from "@/lib/cart";
import { fetchAuthSession } from "@/lib/client-auth";
import { formatNumber, formatPrice } from "@/lib/format";
import type { CartLine, Product } from "@/lib/types";

type PaymentConfig = { enabled?: boolean };

type CustomerProfile = {
  phone: string | null;
  fullName: string;
  address: string;
  postalCode: string;
  city: string;
};

type ProfileResponse = {
  profile?: CustomerProfile;
  complete?: boolean;
};

export function CheckoutView() {
  const router = useRouter();
  const { lines } = useCart();
  const [checkoutLines, setCheckoutLines] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [authOk, setAuthOk] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | undefined>();
  const [onlineEnabled, setOnlineEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectionReady, setSelectionReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(CHECKOUT_LINES_STORAGE_KEY);
    let keys: string[] = [];
    if (raw) {
      try {
        keys = JSON.parse(raw) as string[];
      } catch {
        keys = [];
      }
    }
    const selected = lines.filter((line) => keys.includes(cartLineKey(line)));
    if (selected.length === 0 && lines.length > 0) {
      const allKeys = lines.map((line) => cartLineKey(line));
      sessionStorage.setItem(CHECKOUT_LINES_STORAGE_KEY, JSON.stringify(allKeys));
      setCheckoutLines(lines);
    } else {
      setCheckoutLines(selected);
    }
    setSelectionReady(true);
  }, [lines]);

  const slugsKey = useMemo(
    () => checkoutLines.map((line) => line.productSlug).join(","),
    [checkoutLines],
  );

  useEffect(() => {
    if (!slugsKey) {
      setProducts([]);
      return;
    }
    fetch(apiPath(`/api/products?slugs=${encodeURIComponent(slugsKey)}`))
      .then((response) => response.json())
      .then((data: { products?: Product[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, [slugsKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await fetchAuthSession();
      if (cancelled) return;
      if (!user || user.role !== "customer") {
        router.replace("/login?next=/cart/checkout");
        return;
      }
      setAuthOk(true);

      const [configRes, profileRes] = await Promise.all([
        fetch(apiPath("/api/payment/zarinpal/config")),
        fetch(apiPath("/api/account/profile"), { credentials: "include" }),
      ]);
      const config = (await configRes.json()) as PaymentConfig;
      const profileData = (await profileRes.json()) as ProfileResponse;
      if (!cancelled) {
        setOnlineEnabled(Boolean(config.enabled));
        setProfile(profileData.profile);
        setProfileComplete(Boolean(profileData.complete));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const bySlug = useMemo(
    () => new Map(products.map((product) => [product.slug, product])),
    [products],
  );

  const detailed = checkoutLines.flatMap((line) => {
    const product = bySlug.get(line.productSlug);
    if (!product) return [];
    const color = product.colors.find((item) => item.id === line.color);
    return [{ line, product, colorName: color?.name ?? line.color }];
  });

  const total = detailed.reduce(
    (sum, item) => sum + item.product.price * item.line.quantity,
    0,
  );
  const cartReady = detailed.length === checkoutLines.length && checkoutLines.length > 0;

  if (!selectionReady || (!authOk && loading)) {
    return (
      <p className="px-4 py-20 text-center text-sm text-muted">در حال بارگذاری…</p>
    );
  }

  if (checkoutLines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">پرداخت</h1>
        <p className="mt-4 text-sm text-muted">
          قلم انتخاب‌شده‌ای برای پرداخت ندارید. از سبد خرید انتخاب کنید.
        </p>
        <Link
          href="/cart"
          className="mt-8 inline-block rounded-lg border border-gold px-5 py-3 text-sm text-gold"
        >
          بازگشت به سبد
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <h1 className="text-2xl font-semibold">پرداخت سفارش</h1>
      <p className="mt-2 text-sm text-muted">
        اطلاعات ارسال از حساب کاربری شما استفاده می‌شود.
      </p>

      {profile && (
        <div className="mt-6 rounded-xl border border-white/10 bg-surface/40 p-4 text-sm">
          <p className="font-medium text-cream">{profile.fullName || "—"}</p>
          <p className="mt-1 text-muted" dir="ltr">{profile.phone}</p>
          <p className="mt-2 leading-7 text-cream/85">{profile.address || "آدرس ثبت نشده"}</p>
          {profile.postalCode && (
            <p className="mt-1 text-muted">
              کد پستی: <span dir="ltr">{profile.postalCode}</span>
            </p>
          )}
          {!profileComplete && (
            <Link href="/account" className="mt-3 inline-block text-gold hover:underline">
              تکمیل اطلاعات در حساب کاربری
            </Link>
          )}
        </div>
      )}

      <ul className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10">
        {detailed.map(({ line, product, colorName }) => (
          <li
            key={cartLineKey(line)}
            className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div className="min-w-0">
              <p>{product.name}</p>
              <p className="text-xs text-muted">
                {colorName} / {line.size} × {formatNumber(line.quantity)}
              </p>
            </div>
            <p className="shrink-0 text-gold">
              {formatPrice(product.price * line.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-muted">جمع</span>
        <span className="text-lg font-medium text-gold">{formatPrice(total)}</span>
      </div>

      <div className="mt-8 rounded-xl border border-gold/25 bg-surface/50 p-5">
        {!onlineEnabled && !loading && (
          <p className="text-sm text-muted">درگاه پرداخت آنلاین فعال نیست.</p>
        )}
        {onlineEnabled && profileComplete && (
          <ZarinpalCheckout
            lines={checkoutLines}
            totalTomans={total}
            cartReady={cartReady}
          />
        )}
        {onlineEnabled && !profileComplete && (
          <p className="text-sm text-muted">
            برای پرداخت، نام، آدرس و کد پستی را در{" "}
            <Link href="/account" className="text-gold hover:underline">
              حساب کاربری
            </Link>{" "}
            کامل کنید.
          </p>
        )}
      </div>

      <Link
        href="/cart"
        className="mt-8 inline-block text-sm text-muted hover:text-cream"
      >
        ← بازگشت به سبد خرید
      </Link>
    </div>
  );
}
