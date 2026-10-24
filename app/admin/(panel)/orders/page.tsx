"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listAdminOrders,
  setAdminOrderShipped,
  type AdminOrder,
} from "@/lib/admin-api";
import { formatNumber, formatPrice } from "@/lib/format";

type ShipmentFilter = "all" | "pending" | "shipped";

function formatOrderDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ShipmentFilter>("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await listAdminOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری ناموفق");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    return orders.filter((order) => {
      if (filter === "pending") return !order.shipped;
      if (filter === "shipped") return order.shipped;
      return true;
    });
  }, [orders, filter]);

  async function toggleShipped(order: AdminOrder) {
    setUpdatingId(order.id);
    setError(null);
    try {
      await setAdminOrderShipped(order.id, !order.shipped);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "به‌روزرسانی ناموفق");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-cream">سفارشات</h1>
          <p className="mt-1 text-sm text-muted">
            سفارش‌های پرداخت‌شده برای بسته‌بندی و ارسال
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-muted hover:text-cream"
        >
          ← محصولات
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {(
          [
            ["pending", "ارسال نشده"],
            ["shipped", "ارسال شده"],
            ["all", "همه"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full border px-3 py-1.5 transition ${
              filter === value
                ? "border-gold/50 bg-gold/10 text-cream"
                : "border-white/15 text-muted hover:border-white/25 hover:text-cream"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="self-center text-muted">{visible.length} مورد</span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">در حال بارگذاری…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted">سفارشی در این فیلتر نیست.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((order) => {
            const open = expandedId === order.id;
            return (
              <li
                key={order.id}
                className="rounded-xl border border-white/10 bg-surface/40"
              >
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-right"
                  onClick={() =>
                    setExpandedId(open ? null : order.id)
                  }
                >
                  <span className="font-medium text-cream">
                    #{formatNumber(order.id)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs ${
                      order.shipped
                        ? "bg-emerald-950/50 text-emerald-200"
                        : "bg-amber-950/40 text-amber-100"
                    }`}
                  >
                    {order.shipmentLabel}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {order.shippingFullName}
                  </span>
                  <span className="text-sm text-muted" dir="ltr">
                    {order.shippingPhone}
                  </span>
                  <span className="text-sm text-gold">
                    {formatPrice(order.amountTomans)}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-white/10 px-4 py-4 text-sm">
                    <p className="text-muted">{formatOrderDate(order.createdAt)}</p>
                    {order.refId && (
                      <p className="mt-1 text-muted" dir="ltr">
                        پیگیری زرین‌پال: {order.refId}
                      </p>
                    )}

                    <div className="mt-4 space-y-1 text-cream/90">
                      <p>
                        <span className="text-muted">نام: </span>
                        {order.shippingFullName}
                      </p>
                      <p dir="ltr">
                        <span className="text-muted" dir="rtl">
                          موبایل:{" "}
                        </span>
                        {order.shippingPhone}
                      </p>
                      {order.shippingCity && (
                        <p>
                          <span className="text-muted">شهر: </span>
                          {order.shippingCity}
                        </p>
                      )}
                      <p>
                        <span className="text-muted">آدرس: </span>
                        {order.shippingAddress}
                      </p>
                      {order.shippingPostalCode && (
                        <p>
                          <span className="text-muted">کد پستی: </span>
                          {order.shippingPostalCode}
                        </p>
                      )}
                    </div>

                    <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                      {order.items.map((item, index) => (
                        <li key={`${item.productSlug}-${index}`} className="text-cream">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-muted">
                            سایز {item.size} · رنگ {item.colorLabel} · ×
                            {formatNumber(item.quantity)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => void toggleShipped(order)}
                      className="mt-4 rounded-lg border border-gold/40 px-4 py-2 text-sm text-cream transition hover:bg-gold/10 disabled:opacity-50"
                    >
                      {updatingId === order.id
                        ? "…"
                        : order.shipped
                          ? "برگشت به ارسال نشده"
                          : "علامت‌گذاری: ارسال شده"}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
