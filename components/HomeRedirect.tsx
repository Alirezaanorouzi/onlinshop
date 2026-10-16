"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/collection/men/");
  }, [router]);

  return (
    <p className="px-4 py-20 text-center text-sm text-muted">در حال انتقال…</p>
  );
}
