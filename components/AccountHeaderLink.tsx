"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_SESSION_EVENT, fetchAuthSession } from "@/lib/client-auth";

export function AccountHeaderLink() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      const user = await fetchAuthSession();
      if (!cancelled) setUserRole(user?.role ?? null);
    }

    void sync();
    window.addEventListener(AUTH_SESSION_EVENT, sync);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_SESSION_EVENT, sync);
    };
  }, []);

  const isAdmin = userRole === "admin";
  const isCustomer = userRole === "customer";
  const label = isAdmin
    ? "حساب مدیر"
    : isCustomer
      ? "حساب کاربری"
      : "ورود با شماره موبایل";
  const title = isAdmin
    ? "حساب مدیر"
    : isCustomer
      ? "حساب کاربری"
      : "ورود / ثبت‌نام با موبایل";

  return (
    <Link
      href="/account"
      className="relative grid size-11 place-items-center text-cream/80 hover:text-gold"
      aria-label={label}
      title={title}
    >
      <UserIcon />
      {isAdmin && (
        <span
          className="absolute bottom-1.5 end-1.5 size-2 rounded-full bg-gold ring-2 ring-ink"
          aria-hidden
        />
      )}
    </Link>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19.2c1.4-3 3.8-4.4 7-4.4s5.6 1.4 7 4.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
