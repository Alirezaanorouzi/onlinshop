"use client";

import { useState } from "react";
import { apiPath } from "@/lib/api-path";

export type CustomerProfileFields = {
  phone: string | null;
  fullName: string;
  address: string;
  postalCode: string;
  city: string;
};

type Props = {
  initial: CustomerProfileFields;
  onSaved: (profile: CustomerProfileFields, complete: boolean) => void;
  submitLabel?: string;
};

export function CustomerProfileForm({
  initial,
  onSaved,
  submitLabel = "ذخیره",
}: Props) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(apiPath("/api/account/profile"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await response.json()) as {
        error?: string;
        profile?: CustomerProfileFields;
        complete?: boolean;
      };
      if (!response.ok) {
        setError(data.error ?? "ذخیره ناموفق");
        setSaving(false);
        return;
      }
      const profile = data.profile ?? draft;
      setDraft(profile);
      onSaved(profile, Boolean(data.complete));
      setSaving(false);
    } catch {
      setError("اتصال به سرور برقرار نشد.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-200">
          {error}
        </p>
      )}
      <EditField
        label="نام و نام خانوادگی"
        value={draft.fullName}
        onChange={(v) => setDraft({ ...draft, fullName: v })}
        required
      />
      <EditField
        label="شهر"
        value={draft.city}
        onChange={(v) => setDraft({ ...draft, city: v })}
      />
      <EditField
        label="آدرس پستی"
        value={draft.address}
        onChange={(v) => setDraft({ ...draft, address: v })}
        multiline
        required
      />
      <EditField
        label="کد پستی"
        value={draft.postalCode}
        onChange={(v) =>
          setDraft({
            ...draft,
            postalCode: v.replace(/\D/g, "").slice(0, 10),
          })
        }
        dir="ltr"
        inputMode="numeric"
        required
      />
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-gold py-3 text-sm font-medium text-ink disabled:opacity-50"
      >
        {saving ? "ذخیره…" : submitLabel}
      </button>
    </form>
  );
}

function EditField({
  label,
  value,
  onChange,
  multiline,
  required,
  dir,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
  dir?: "ltr" | "rtl";
  inputMode?: "numeric" | "text";
}) {
  const className =
    "mt-1.5 w-full rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-sm focus:border-gold/40 focus:outline-none";
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      {multiline ? (
        <textarea
          required={required}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${className} resize-none leading-7`}
        />
      ) : (
        <input
          required={required}
          dir={dir}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      )}
    </label>
  );
}
