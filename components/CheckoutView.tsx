"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CustomerProfileForm,
  type CustomerProfileFields,
} from "@/components/CustomerProfileForm";
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

type ProfileResponse = {
  profile?: CustomerProfileFields;
  complete?: boolean;
};

const emptyProfile = (phone: string | null): CustomerProfileFields => ({
  phone,
  fullName: "",
  address: "",
  postalCode: "",
  city: "",
});

export function CheckoutView() {
  const router = useRouter();
  const { lines } = useCart();
  const [checkoutLines, setCheckoutLines] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [authOk, setAuthOk] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profile, setProfile] = useState<CustomerProfileFields | undefined>();
  const [onlineEnabled, setOnlineEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectionReady, setSelectionReady] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

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
      setProductsLoading(false);
      return;
    }
    setProductsLoading(true);
    fetch(apiPath(`/api/products?slugs=${encodeURIComponent(slugsKey)}`))
      .then((response) => response.json())
      .then((data: { products?: Product[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
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
        const p = profileData.profile ?? emptyProfile(user.phone ?? null);
        setProfile(p);
        const complete = Boolean(profileData.complete);
        setProfileComplete(complete);
        setShowProfileForm(false);
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
  const cartReady =
    checkoutLines.length > 0 && detailed.length === checkoutLines.length;
  const cartProductsMissing =
    checkoutLines.length > 0 &&
    !productsLoading &&
    detailed.length < checkoutLines.length;

  function handleProfileSaved(p: CustomerProfileFields, complete: boolean) {
    setProfile(p);
    setProfileComplete(complete);
    if (complete) setShowProfileForm(false);
  }

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

      {profile && !showProfileForm && profileComplete && (
        <div className="mt-6 rounded-xl border border-white/10 bg-surface/40 p-4 text-sm">
          <p className="font-medium text-cream">{profile.fullName || "—"}</p>
          <p className="mt-1 text-muted" dir="ltr">{profile.phone}</p>
          <p className="mt-2 leading-7 text-cream/85">{profile.address || "آدرس ثبت نشده"}</p>
          {profile.postalCode && (
            <p className="mt-1 text-muted">
              کد پستی: <span dir="ltr">{profile.postalCode}</span>
            </p>
          )}
          <button
            type="button"
            className="mt-3 text-sm text-muted hover:text-cream"
            onClick={() => setShowProfileForm(true)}
          >
            ویرایش آدرس
          </button>
        </div>
      )}

      {profile && (showProfileForm || !profileComplete) && (
        <div className="mt-6 rounded-xl border border-gold/25 bg-surface/40 p-4">
          <h2 className="mb-4 text-sm font-medium text-cream">
            تکمیل اطلاعات کاربری
          </h2>
          <CustomerProfileForm
            key={`${profile.phone ?? ""}-${profile.postalCode}-${profile.fullName}`}
            initial={profile}
            onSaved={handleProfileSaved}
            submitLabel="ذخیره و ادامه پرداخت"
          />
          {profileComplete && showProfileForm && (
            <button
              type="button"
              className="mt-3 w-full text-sm text-muted hover:text-cream"
              onClick={() => setShowProfileForm(false)}
            >
              انصراف
            </button>
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
          <>
            {cartProductsMissing && (
              <p className="mb-4 text-sm text-red-200">
                برخی محصولات سبد در دسترس نیستند. به سبد خرید برگردید و دوباره
                انتخاب کنید.
              </p>
            )}
            <ZarinpalCheckout
              lines={checkoutLines}
              totalTomans={total}
              cartReady={cartReady}
              productsLoading={productsLoading}
            />
          </>
        )}
        {onlineEnabled && !profileComplete && (
          <p className="text-sm text-muted">
            پس از ذخیرهٔ اطلاعات ارسال، دکمهٔ پرداخت فعال می‌شود.
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
