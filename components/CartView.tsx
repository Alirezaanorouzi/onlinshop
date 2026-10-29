"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { assetPath } from "@/lib/asset-path";
import {
  CHECKOUT_LINES_STORAGE_KEY,
  cartLineKey,
} from "@/lib/cart-line-key";
import {
  classifyCartLine,
  filterPayableCartLines,
  type CartLineCatalogStatus,
} from "@/lib/cart-validation";
import { useCart } from "@/lib/cart";
import { fetchAuthSession } from "@/lib/client-auth";
import { business } from "@/lib/business";
import { formatNumber, formatPrice } from "@/lib/format";
import { useCartCatalogSync } from "@/lib/use-cart-catalog-sync";
import type { CartLine } from "@/lib/types";

function statusLabel(status: CartLineCatalogStatus): string | null {
  if (status === "out_of_stock") return "این مدل دیگر موجود نیست.";
  return null;
}

export function CartView() {
  const router = useRouter();
  const { lines, setQuantity, removeItem } = useCart();
  const {
    bySlug,
    productsLoading,
    catalogLoaded,
    fetchError,
    prunedCount,
  } = useCartCatalogSync(lines);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [loggedIn, setLoggedIn] = useState(false);
  const [showPrunedNotice, setShowPrunedNotice] = useState(false);

  useEffect(() => {
    void fetchAuthSession().then((user) => {
      setLoggedIn(user?.role === "customer");
    });
  }, []);

  useEffect(() => {
    if (prunedCount > 0) setShowPrunedNotice(true);
  }, [prunedCount]);

  useEffect(() => {
    if (!catalogLoaded || fetchError) {
      setSelectedKeys(new Set(lines.map((line) => cartLineKey(line))));
      return;
    }
    const payable = filterPayableCartLines(lines, [...bySlug.values()]);
    setSelectedKeys(new Set(payable.map((line) => cartLineKey(line))));
  }, [lines, catalogLoaded, fetchError, bySlug]);

  const rows = useMemo(() => {
    return lines.map((line) => {
      const product = bySlug.get(line.productSlug);
      const status: CartLineCatalogStatus =
        catalogLoaded && !fetchError
          ? classifyCartLine(line, bySlug)
          : product
            ? "ok"
            : "missing_product";
      const color = product?.colors.find((item) => item.id === line.color);
      return {
        line,
        product,
        colorName: color?.name ?? line.color,
        status,
      };
    });
  }, [lines, bySlug, catalogLoaded, fetchError]);

  const selectedLines = lines.filter((line) =>
    selectedKeys.has(cartLineKey(line)),
  );

  const selectedTotal = rows
    .filter(
      ({ line, status }) =>
        selectedKeys.has(cartLineKey(line)) && status === "ok" && line,
    )
    .reduce(
      (sum, { line, product }) =>
        sum + (product?.price ?? 0) * line.quantity,
      0,
    );

  const payableSelected = filterPayableCartLines(
    selectedLines,
    [...bySlug.values()],
  );

  function toggleLine(line: CartLine, checked: boolean, selectable: boolean) {
    if (!selectable) return;
    const key = cartLineKey(line);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function goToCheckout() {
    if (payableSelected.length === 0) return;
    sessionStorage.setItem(
      CHECKOUT_LINES_STORAGE_KEY,
      JSON.stringify(payableSelected.map((line) => cartLineKey(line))),
    );
    if (!loggedIn) {
      router.push("/login?next=/cart/checkout");
      return;
    }
    router.push("/cart/checkout");
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-3xl font-semibold">سبد خرید</h1>
        <p className="mt-6 text-sm text-muted">سبد خرید خالی است.</p>
        <Link
          href="/collection/men"
          className="mt-8 inline-block border border-gold px-5 py-3 text-sm text-gold"
        >
          دیدن کالکشن آقایان
        </Link>
      </div>
    );
  }

  const issuedAt = new Date().toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const showLoading = productsLoading && !catalogLoaded;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-semibold">سبد خرید</h1>
      <p className="mt-2 text-sm text-muted">
        {business.legalName} · {issuedAt}
      </p>
      <p className="mt-2 text-xs text-muted">
        قلم‌هایی که می‌خواهید بخرید را انتخاب کنید؛ آدرس در{" "}
        <Link href="/account" className="text-gold hover:underline">
          حساب کاربری
        </Link>{" "}
        ثبت می‌شود.
      </p>

      {showPrunedNotice && (
        <p
          className="mt-4 rounded-lg border border-amber-500/35 bg-amber-950/25 px-3 py-2 text-sm text-amber-100"
          role="status"
        >
          برخی اقلام دیگر در فروشگاه نیستند و از سبد حذف شدند.
          <button
            type="button"
            className="mr-2 text-xs text-muted underline hover:text-cream"
            onClick={() => setShowPrunedNotice(false)}
          >
            بستن
          </button>
        </p>
      )}

      {fetchError && (
        <p className="mt-4 text-sm text-red-200" role="alert">
          بارگذاری اطلاعات محصول ناموفق بود. اتصال را بررسی کنید و صفحه را
          دوباره باز کنید.
        </p>
      )}

      {showLoading && (
        <p className="mt-6 text-sm text-muted">در حال بارگذاری محصولات…</p>
      )}

      <div className="mt-8 hidden overflow-x-auto rounded-xl border border-white/10 md:block">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="bg-surface/60 text-muted">
            <tr>
              <th className="px-3 py-3 text-right font-normal">انتخاب</th>
              <th className="px-3 py-3 text-right font-normal">شرح</th>
              <th className="px-3 py-3 text-right font-normal">تعداد</th>
              <th className="px-3 py-3 text-right font-normal">جمع</th>
              <th className="px-3 py-3 text-right font-normal" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ line, product, colorName, status }) => {
              const key = cartLineKey(line);
              const selectable = status === "ok" && Boolean(product);
              const label = statusLabel(status);
              return (
                <tr key={key} className="border-t border-white/10">
                  <td className="px-3 py-4">
                    <input
                      type="checkbox"
                      checked={selectable && selectedKeys.has(key)}
                      disabled={!selectable}
                      onChange={(e) =>
                        toggleLine(line, e.target.checked, selectable)
                      }
                      aria-label={`انتخاب ${product?.name ?? line.productSlug}`}
                    />
                  </td>
                  <td className="px-3 py-4">
                    {product ? (
                      <Link
                        href={`/product/${product.slug}`}
                        className="hover:text-gold"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <span className="text-muted">{line.productSlug}</span>
                    )}
                    <span className="mt-1 block text-xs text-muted">
                      {colorName} / {line.size}
                    </span>
                    {label && (
                      <span className="mt-1 block text-xs text-red-200">
                        {label}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="grid size-7 place-items-center border border-white/15"
                        aria-label="کم کردن"
                        onClick={() => setQuantity(line, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{formatNumber(line.quantity)}</span>
                      <button
                        type="button"
                        className="grid size-7 place-items-center border border-white/15"
                        aria-label="زیاد کردن"
                        onClick={() => setQuantity(line, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gold">
                    {product
                      ? formatPrice(product.price * line.quantity)
                      : "—"}
                  </td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      className="text-xs text-muted hover:text-cream"
                      onClick={() => removeItem(line)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="mt-8 divide-y divide-white/10 md:hidden">
        {rows.map(({ line, product, colorName, status }) => {
          const key = cartLineKey(line);
          const selectable = status === "ok" && Boolean(product);
          const label = statusLabel(status);
          return (
            <li key={`m-${key}`} className="flex gap-3 py-5">
              <input
                type="checkbox"
                className="mt-2"
                checked={selectable && selectedKeys.has(key)}
                disabled={!selectable}
                onChange={(e) =>
                  toggleLine(line, e.target.checked, selectable)
                }
                aria-label={`انتخاب ${product?.name ?? line.productSlug}`}
              />
              {product ? (
                <Image
                  src={assetPath(product.image)}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="size-24 shrink-0 object-cover"
                />
              ) : (
                <div className="size-24 shrink-0 bg-surface/60" />
              )}
              <div className="min-w-0 flex-1">
                {product ? (
                  <Link href={`/product/${product.slug}`} className="text-sm">
                    {product.name}
                  </Link>
                ) : (
                  <span className="text-sm text-muted">{line.productSlug}</span>
                )}
                <p className="mt-1 text-xs text-muted">
                  {colorName} / {line.size}
                </p>
                {label && (
                  <p className="mt-1 text-xs text-red-200">{label}</p>
                )}
                {product && (
                  <p className="mt-2 text-sm text-gold">
                    {formatPrice(product.price)}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    className="grid size-8 place-items-center border border-white/15"
                    aria-label="کم کردن"
                    onClick={() => setQuantity(line, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm">
                    {formatNumber(line.quantity)}
                  </span>
                  <button
                    type="button"
                    className="grid size-8 place-items-center border border-white/15"
                    aria-label="زیاد کردن"
                    onClick={() => setQuantity(line, line.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-cream"
                    onClick={() => removeItem(line)}
                  >
                    حذف
                  </button>
                </div>
              </div>
              {product && (
                <p className="text-sm">
                  {formatPrice(product.price * line.quantity)}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">جمع اقلام انتخاب‌شده</span>
          <span className="text-lg font-medium text-gold">
            {formatPrice(selectedTotal)}
          </span>
        </div>
        <button
          type="button"
          disabled={payableSelected.length === 0}
          onClick={goToCheckout}
          className="w-full rounded-lg bg-gold py-3.5 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[14rem] sm:px-8"
        >
          ادامه و پرداخت
        </button>
        {payableSelected.length === 0 && (
          <p className="text-xs text-muted">
            حداقل یک قلم موجود را برای پرداخت انتخاب کنید.
          </p>
        )}
      </div>
    </div>
  );
}
