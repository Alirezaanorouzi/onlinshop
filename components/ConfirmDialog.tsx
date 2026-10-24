"use client";

import { useEffect } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "بله",
  cancelLabel = "خیر",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="بستن"
        disabled={busy}
        onClick={onCancel}
      />
      <div
        className="relative w-full max-w-xs rounded-xl border border-white/10 bg-elevated px-4 py-4 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-sm font-semibold text-cream">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={busy}
            className="flex-1 rounded-lg border border-white/15 py-2.5 text-sm text-cream hover:bg-white/5 disabled:opacity-50"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
            onClick={onConfirm}
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
