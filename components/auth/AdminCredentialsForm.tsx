"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPath } from "@/lib/api-path";
import { clearStoredAdminToken } from "@/lib/admin-api";
import { notifyAuthSessionChanged } from "@/lib/client-auth";

async function readError(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { error?: string };
    return json.error ?? text;
  } catch {
    return text || `خطا (${response.status})`;
  }
}

type AdminCredentialsFormProps = {
  redirectTo: string;
};

export function AdminCredentialsForm({ redirectTo }: AdminCredentialsFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(apiPath("/api/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        setError(await readError(response));
        setBusy(false);
        return;
      }

      clearStoredAdminToken();
      const safe =
        redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/account";
      notifyAuthSessionChanged();
      const here =
        typeof window !== "undefined" ? window.location.pathname : "";
      if (here !== safe) {
        router.push(safe);
      }
      router.refresh();
      setBusy(false);
    } catch {
      setError("اتصال به سرور برقرار نشد.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-start">
      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <label className="block text-sm">
        <span className="text-muted">ایمیل</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm"
          dir="ltr"
        />
      </label>
      <label className="block text-sm">
        <span className="text-muted">رمز عبور</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm"
          dir="ltr"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-gold py-2.5 text-sm font-medium text-ink disabled:opacity-50"
      >
        {busy ? "ورود…" : "ورود مدیر"}
      </button>
    </form>
  );
}
