"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AccountProfileComplete } from "@/components/AccountProfileComplete";
import { AccountSignIn } from "@/components/auth/AccountSignIn";
import { CustomerAccountPanel } from "@/components/CustomerAccountPanel";
import { clearStoredAdminToken } from "@/lib/admin-api";
import {
  AUTH_SESSION_EVENT,
  fetchAuthSession,
  logoutAuthSession,
} from "@/lib/client-auth";

function AccountViewBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const completeFlow = searchParams.get("complete") === "1";
  const returnTo = searchParams.get("next")?.trim() || "/account";
  const [sessionUser, setSessionUser] = useState<
    Awaited<ReturnType<typeof fetchAuthSession>>
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const user = await fetchAuthSession();
      if (!cancelled) {
        setSessionUser(user);
        setLoading(false);
      }
    }

    void loadSession();
    const onChange = () => {
      cancelled = false;
      setLoading(true);
      void loadSession();
    };
    window.addEventListener(AUTH_SESSION_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_SESSION_EVENT, onChange);
    };
  }, []);

  if (loading) {
    return (
      <p className="px-4 py-20 text-center text-sm text-muted">در حال بارگذاری…</p>
    );
  }

  if (sessionUser?.role === "customer" && sessionUser.phone) {
    if (completeFlow) {
      return (
        <AccountProfileComplete phone={sessionUser.phone} returnTo={returnTo} />
      );
    }
    return <CustomerAccountPanel phone={sessionUser.phone} />;
  }

  if (sessionUser?.role === "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <h1 className="text-2xl font-semibold">حساب مدیر</h1>
        <p className="mt-2 text-sm text-muted" dir="ltr">
          {sessionUser.phone ?? sessionUser.email}
        </p>
        <p className="mt-4 text-sm leading-8 text-cream/80">
          می‌توانید محصولات را مدیریت کنید یا مثل مشتری در فروشگاه بگردید.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/admin"
            className="inline-block rounded-lg bg-gold px-5 py-3 text-center text-sm font-medium text-ink"
          >
            پنل مدیریت محصولات
          </Link>
          <Link
            href="/collection/men"
            className="inline-block border border-white/20 px-5 py-3 text-center text-sm text-cream"
          >
            مشاهده فروشگاه
          </Link>
        </div>
        <button
          type="button"
          className="mt-8 text-sm text-muted hover:text-cream"
          onClick={async () => {
            await logoutAuthSession();
            clearStoredAdminToken();
            router.refresh();
          }}
        >
          خروج
        </button>
      </div>
    );
  }

  const signInNext = completeFlow
    ? `/account?complete=1&next=${encodeURIComponent(returnTo)}`
    : "/account";
  return <AccountSignIn redirectTo={signInNext} />;
}

export function AccountView() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-20 text-center text-sm text-muted">در حال بارگذاری…</p>
      }
    >
      <AccountViewBody />
    </Suspense>
  );
}
