"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiPath } from "@/lib/api-path";
import { logoutAuthSession } from "@/lib/client-auth";
import { clearStoredAdminToken } from "@/lib/admin-api";
import { formatIranMobileDisplay } from "@/lib/phone-ir";
import { formatNumber, formatPrice } from "@/lib/format";

type Profile = {
  phone: string | null;
  fullName: string;
  address: string;
  postalCode: string;
  city: string;
};

type Order = {
  id: number;
  amountTomans: number;
  status:
    | "awaiting_payment"
    | "paid"
    | "processing"
    | "shipped"
    | "cancelled"
    | "failed";
  refId: string | null;
  createdAt: string;
  itemCount: number;
};

type AccountSection = "profile" | "orders" | "logout";

const sectionTitle: Record<AccountSection, string> = {
  profile: "پروفایل",
  orders: "سفارش‌های من",
  logout: "خروج",
};

function orderStatusLabel(status: Order["status"]) {
  if (status === "paid") return "پرداخت شده";
  if (status === "processing") return "در حال آماده‌سازی";
  if (status === "shipped") return "ارسال شده";
  if (status === "awaiting_payment") return "در انتظار پرداخت";
  if (status === "cancelled") return "لغو شده";
  return "ناموفق";
}

function orderStatusClass(status: Order["status"]) {
  if (status === "paid" || status === "processing" || status === "shipped") {
    return "bg-emerald-500/15 text-emerald-200";
  }
  if (status === "awaiting_payment") return "bg-amber-500/15 text-amber-200";
  return "bg-red-500/15 text-red-200";
}

function ProfileInfoRow({
  label,
  value,
  dir,
}: {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="py-4 first:pt-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm leading-7 text-cream" dir={dir}>
        {value}
      </p>
    </div>
  );
}

export function CustomerAccountPanel({ phone }: { phone: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderSuccess = searchParams.get("order") === "success";
  const menuRef = useRef<HTMLDivElement>(null);

  const [section, setSection] = useState<AccountSection>(
    orderSuccess ? "orders" : "profile",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [profileRes, ordersRes] = await Promise.all([
      fetch(apiPath("/api/account/profile"), { credentials: "include" }),
      fetch(apiPath("/api/account/orders"), { credentials: "include" }),
    ]);
    const base = emptyProfile(phone);
    if (profileRes.ok) {
      const data = (await profileRes.json()) as { profile: Profile };
      const p = data.profile ?? base;
      setProfile(p);
      setDraft(p);
    } else {
      setProfile(base);
      setDraft(base);
    }
    if (ordersRes.ok) {
      const data = (await ordersRes.json()) as { orders: Order[] };
      setOrders(data.orders);
    }
    setLoading(false);
  }, [phone]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (section === "orders" && !loading) {
      void fetch(apiPath("/api/account/orders"), { credentials: "include" })
        .then((r) => r.json())
        .then((data: { orders?: Order[] }) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch(() => undefined);
    }
  }, [section, loading]);

  function pickSection(next: AccountSection) {
    setSection(next);
    setMenuOpen(false);
    setEditingProfile(false);
    setError(null);
    setSaved(false);
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch(apiPath("/api/account/profile"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await response.json()) as { error?: string; profile?: Profile };
      if (!response.ok) {
        setError(data.error ?? "ذخیره ناموفق");
        setSaving(false);
        return;
      }
      const p = data.profile ?? draft;
      setProfile(p);
      setDraft(p);
      setSaved(true);
      setEditingProfile(false);
      setSaving(false);
    } catch {
      setError("اتصال به سرور برقرار نشد.");
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAuthSession();
    clearStoredAdminToken();
    router.replace("/account");
    router.refresh();
  }

  const displayPhone = formatIranMobileDisplay(phone);

  return (
    <div className="relative mx-auto min-h-[70vh] max-w-lg px-4 pb-12 pt-[max(1.5rem,env(safe-area-inset-top))]">
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-10 bg-ink/40 backdrop-blur-[2px]"
          aria-label="بستن منو"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <header className="relative z-20 flex min-h-11 items-center justify-center">
        <div ref={menuRef} className="absolute left-0 top-0 z-30">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl border border-white/10 text-cream hover:border-gold/40 hover:text-gold"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="منوی حساب"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
          </button>

          {menuOpen && (
            <ul
              role="menu"
              className="absolute left-0 top-full z-40 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-white/10 bg-elevated py-1 shadow-xl"
            >
              {(["profile", "orders", "logout"] as AccountSection[]).map((id) => (
                <li key={id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className={`w-full px-4 py-3 text-start text-sm transition hover:bg-white/5 ${
                      section === id ? "text-gold" : "text-cream"
                    }`}
                    onClick={() => pickSection(id)}
                  >
                    {sectionTitle[id]}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <h1 className="text-lg font-semibold">{sectionTitle[section]}</h1>
      </header>

      <main className="mt-8">
        {section === "profile" && (
          <section aria-label="پروفایل">
            {loading ? (
              <p className="py-16 text-center text-sm text-muted">در حال بارگذاری…</p>
            ) : editingProfile && draft ? (
              <form onSubmit={saveProfile} className="space-y-4">
                {error && (
                  <p className="rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-200">
                    {error}
                  </p>
                )}
                <EditField
                  label="نام و نام خانوادگی"
                  value={draft.fullName}
                  onChange={(v) => setDraft({ ...draft, fullName: v })}
                  required
                />
                <EditField
                  label="شهر"
                  value={draft.city}
                  onChange={(v) => setDraft({ ...draft, city: v })}
                />
                <EditField
                  label="آدرس پستی"
                  value={draft.address}
                  onChange={(v) => setDraft({ ...draft, address: v })}
                  multiline
                  required
                />
                <EditField
                  label="کد پستی"
                  value={draft.postalCode}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      postalCode: v.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  dir="ltr"
                  inputMode="numeric"
                  required
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-gold py-3 text-sm font-medium text-ink disabled:opacity-50"
                  >
                    {saving ? "ذخیره…" : "ذخیره"}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-white/15 px-4 py-3 text-sm text-muted"
                    onClick={() => {
                      setDraft(profile);
                      setEditingProfile(false);
                      setError(null);
                    }}
                  >
                    انصراف
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {saved && (
                  <p className="mb-4 text-sm text-gold">اطلاعات به‌روز شد.</p>
                )}
                <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-surface/25 px-5">
                  <ProfileInfoRow
                    label="نام و نام خانوادگی"
                    value={profile?.fullName?.trim() || "ثبت نشده"}
                  />
                  <ProfileInfoRow
                    label="شماره موبایل"
                    value={displayPhone}
                    dir="ltr"
                  />
                  <ProfileInfoRow
                    label="شهر"
                    value={profile?.city?.trim() || "—"}
                  />
                  <ProfileInfoRow
                    label="آدرس"
                    value={profile?.address?.trim() || "ثبت نشده"}
                  />
                  <ProfileInfoRow
                    label="کد پستی"
                    value={profile?.postalCode?.trim() || "ثبت نشده"}
                    dir="ltr"
                  />
                </div>
                <button
                  type="button"
                  className="mt-6 text-sm text-gold hover:underline"
                  onClick={() => {
                    setDraft(profile);
                    setEditingProfile(true);
                    setSaved(false);
                  }}
                >
                  ویرایش اطلاعات
                </button>
              </div>
            )}
          </section>
        )}

        {section === "orders" && (
          <section aria-label="سفارش‌ها">
            {orderSuccess && (
              <p className="mb-4 rounded-xl border border-gold/35 bg-gold/10 px-4 py-3 text-sm text-cream">
                پرداخت موفق بود.
              </p>
            )}
            {loading ? (
              <p className="py-16 text-center text-sm text-muted">در حال بارگذاری…</p>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 px-4 py-16 text-center">
                <p className="text-sm text-muted">سفارشی ثبت نشده است.</p>
                <Link
                  href="/collection/men"
                  className="mt-4 inline-block text-sm text-gold hover:underline"
                >
                  شروع خرید
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-2xl border border-white/10 bg-surface/25 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${orderStatusClass(order.status)}`}
                      >
                        {orderStatusLabel(order.status)}
                      </span>
                      <span className="font-medium text-gold">
                        {formatPrice(order.amountTomans)}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-muted">
                      سفارش #{formatNumber(order.id)}
                      {" · "}
                      {new Date(order.createdAt).toLocaleString("fa-IR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {" · "}
                      {formatNumber(order.itemCount)} قلم
                    </p>
                    {order.refId && (
                      <p className="mt-2 text-xs text-cream/80" dir="ltr">
                        {order.refId}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {section === "logout" && (
          <section
            aria-label="خروج"
            className="rounded-2xl border border-white/10 bg-surface/25 px-4 py-12 text-center"
          >
            <p className="text-sm leading-8 text-muted">
              برای خرید و پیگیری سفارش بعد از خروج، دوباره با موبایل وارد شوید.
            </p>
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
              className="mt-8 w-full rounded-xl border border-red-400/45 py-3.5 text-sm font-medium text-red-200 hover:bg-red-950/25 disabled:opacity-50"
            >
              {loggingOut ? "خروج…" : "خروج از حساب"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  multiline,
  required,
  dir,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
  dir?: "ltr" | "rtl";
  inputMode?: "numeric" | "text";
}) {
  const className =
    "mt-1.5 w-full rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-sm focus:border-gold/40 focus:outline-none";
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      {multiline ? (
        <textarea
          required={required}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${className} resize-none leading-7`}
        />
      ) : (
        <input
          required={required}
          dir={dir}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      )}
    </label>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function emptyProfile(phone: string): Profile {
  return {
    phone,
    fullName: "",
    address: "",
    postalCode: "",
    city: "",
  };
}
