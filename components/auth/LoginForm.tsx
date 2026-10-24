"use client";

import { useSearchParams } from "next/navigation";
import { AccountSignIn } from "@/components/auth/AccountSignIn";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next")?.trim() || "/account";

  const title = next.startsWith("/admin") ? "ورود مدیر" : "ورود";

  return <AccountSignIn redirectTo={next} title={title} />;
}
