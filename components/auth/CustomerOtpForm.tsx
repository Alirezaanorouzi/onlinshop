"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiPath } from "@/lib/api-path";
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

type Step = "phone" | "code";

type CustomerOtpFormProps = {
  redirectTo: string;
};

export function CustomerOtpForm({ redirectTo }: CustomerOtpFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function sendCode() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(apiPath("/api/auth/otp/send"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (!response.ok) {
        const message = await readError(response);
        setError(message);
        if (response.status === 429) setCooldown(60);
        setBusy(false);
        return;
      }
      setStep("code");
      setCode("");
      setCooldown(60);
      setBusy(false);
    } catch {
      setError("اتصال به سرور برقرار نشد.");
      setBusy(false);
    }
  }

  async function verifyAndLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(apiPath("/api/auth/otp/verify"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          code: code.trim(),
        }),
      });

      if (!response.ok) {
        setError(await readError(response));
        setBusy(false);
        return;
      }

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

  if (step === "phone") {
    return (
      <div className="space-y-4 text-sm">
        <p className="text-muted leading-7">
          شماره موبایل خود را وارد کنید. کد یک‌بارمصرف با پیامک برای شما ارسال
          می‌شود.
        </p>
        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        <label className="block">
          <span className="text-muted">شماره موبایل</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-surface px-3 py-2"
            dir="ltr"
          />
        </label>
        <button
          type="button"
          disabled={busy || !phone.trim()}
          onClick={() => void sendCode()}
          className="w-full rounded-lg bg-gold py-2.5 font-medium text-ink disabled:opacity-50"
        >
          {busy ? "در حال ارسال…" : "تأیید و ارسال کد"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={verifyAndLogin} className="space-y-4 text-sm">
      <p className="text-muted leading-7">
        کد ارسال‌شده به{" "}
        <span className="text-cream" dir="ltr">{phone.trim()}</span> را وارد
        کنید.
      </p>
      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <label className="block">
        <span className="text-muted">کد یک‌بارمصرف</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="۱۲۳۴۵۶"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="mt-1 w-full rounded-lg border border-white/15 bg-surface px-3 py-2 tracking-widest"
          dir="ltr"
        />
      </label>
      <button
        type="submit"
        disabled={busy || code.length < 5}
        className="w-full rounded-lg bg-gold py-2.5 font-medium text-ink disabled:opacity-50"
      >
        {busy ? "ورود…" : "ورود به حساب"}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <button
          type="button"
          className="text-gold hover:underline"
          onClick={() => {
            setStep("phone");
            setError(null);
          }}
        >
          تغییر شماره
        </button>
        <button
          type="button"
          disabled={busy || cooldown > 0}
          className="hover:text-cream disabled:opacity-50"
          onClick={() => void sendCode()}
        >
          {cooldown > 0 ? `ارسال مجدد (${cooldown})` : "ارسال مجدد کد"}
        </button>
      </div>
    </form>
  );
}
