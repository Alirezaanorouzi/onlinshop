"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredAdminToken } from "@/lib/admin-api";
import { AUTH_SESSION_EVENT, fetchAuthSession } from "@/lib/client-auth";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (getStoredAdminToken()) {
        if (!cancelled) setAllowed(true);
        return;
      }
      const user = await fetchAuthSession();
      if (cancelled) return;
      if (user?.role === "admin") {
        setAllowed(true);
        return;
      }
      setAllowed(false);
      router.replace("/login?next=/admin");
    }

    void check();
    window.addEventListener(AUTH_SESSION_EVENT, check);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_SESSION_EVENT, check);
    };
  }, [router]);

  if (!allowed) {
    return (
      <p className="px-4 py-20 text-center text-sm text-muted">در حال بارگذاری…</p>
    );
  }

  return <>{children}</>;
}
