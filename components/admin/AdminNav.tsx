"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearStoredAdminToken } from "@/lib/admin-api";
import { logoutAuthSession } from "@/lib/client-auth";

export function AdminNav() {
  const router = useRouter();

  return (
    <header className="border-b border-white/10 bg-surface/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/admin" className="font-semibold text-cream">
          پنل مدیریت
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/collection/men" className="text-muted hover:text-cream">
            فروشگاه
          </Link>
          <button
            type="button"
            className="text-muted hover:text-cream"
            onClick={async () => {
              await logoutAuthSession();
              clearStoredAdminToken();
              router.replace("/login?next=/admin");
            }}
          >
            خروج مدیر
          </button>
        </div>
      </div>
    </header>
  );
}
