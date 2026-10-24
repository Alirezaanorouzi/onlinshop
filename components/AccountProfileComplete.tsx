"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CustomerProfileForm,
  type CustomerProfileFields,
} from "@/components/CustomerProfileForm";
import { apiPath } from "@/lib/api-path";

export function AccountProfileComplete({
  phone,
  returnTo,
}: {
  phone: string;
  returnTo: string;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfileFields | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch(apiPath("/api/account/profile"), {
      credentials: "include",
    });
    if (response.ok) {
      const data = (await response.json()) as { profile?: CustomerProfileFields };
      setProfile(
        data.profile ?? {
          phone,
          fullName: "",
          address: "",
          postalCode: "",
          city: "",
        },
      );
    } else {
      setProfile({
        phone,
        fullName: "",
        address: "",
        postalCode: "",
        city: "",
      });
    }
    setLoading(false);
  }, [phone]);

  useEffect(() => {
    void load();
  }, [load]);

  function onSaved(_profile: CustomerProfileFields, complete: boolean) {
    if (complete) {
      router.push(returnTo);
      return;
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <h1 className="text-xl font-semibold text-cream">تکمیل اطلاعات کاربری</h1>
      <p className="mt-2 text-sm text-muted">
        نام، آدرس و کد پستی برای ارسال سفارش لازم است.
      </p>

      {loading || !profile ? (
        <p className="mt-10 text-sm text-muted">در حال بارگذاری…</p>
      ) : (
        <div className="mt-8">
          <CustomerProfileForm
            initial={profile}
            onSaved={onSaved}
            submitLabel="ذخیره"
          />
        </div>
      )}

      <Link
        href={returnTo}
        className="mt-8 inline-block text-sm text-muted hover:text-cream"
      >
        ← بازگشت
      </Link>
    </div>
  );
}
