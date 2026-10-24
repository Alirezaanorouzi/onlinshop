import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-20 text-center text-sm text-muted">در حال بارگذاری…</p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
