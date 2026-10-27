"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { productPagePath } from "@/lib/product-share-url";

function buildShareUrl(slug: string): string {
  const path = productPagePath(slug);
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return site ? `${site}${path}` : path;
}

export function ProductShareButton({
  slug,
  productName,
  className = "",
  variant = "overlay",
}: {
  slug: string;
  productName: string;
  className?: string;
  /** `overlay` = on product card image; `inline` = admin rows, product page */
  variant?: "overlay" | "inline";
}) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const canNativeShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const showHint = useCallback((text: string) => {
    setHint(text);
    window.setTimeout(() => setHint(null), 2000);
  }, []);

  const copyLink = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const url = buildShareUrl(slug);
      try {
        await navigator.clipboard.writeText(url);
        showHint("کپی شد");
        setOpen(false);
      } catch {
        showHint("کپی ناموفق");
      }
    },
    [slug, showHint],
  );

  const nativeShare = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const url = buildShareUrl(slug);
      try {
        await navigator.share({
          title: productName,
          text: productName,
          url,
        });
        setOpen(false);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        showHint("اشتراک‌گذاری ناموفق");
      }
    },
    [slug, productName, showHint],
  );

  const toggleMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen((prev) => !prev);
  }, []);

  const buttonClass =
    variant === "overlay"
      ? "grid size-8 place-items-center rounded-full bg-ink/75 text-cream ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-ink hover:text-gold"
      : "grid size-9 place-items-center rounded-lg border border-white/15 text-muted transition hover:border-gold/40 hover:text-cream";

  const menuPosition =
    variant === "overlay"
      ? "absolute bottom-full left-0 mb-2 min-w-[10.5rem]"
      : "absolute left-0 top-full z-20 mt-1 min-w-[10.5rem]";

  const wrapperClass =
    variant === "overlay"
      ? `pointer-events-none absolute bottom-2 left-2 z-10 flex items-end gap-2 ${className}`
      : `relative shrink-0 ${className}`;

  return (
    <div className={wrapperClass}>
      <div ref={rootRef} className="pointer-events-auto relative">
        <button
          type="button"
          className={buttonClass}
          aria-label={`اشتراک‌گذاری ${productName}`}
          aria-expanded={open}
          aria-haspopup="menu"
          title="اشتراک‌گذاری لینک محصول"
          onClick={toggleMenu}
        >
          <ShareIcon />
        </button>

        {open && (
          <div
            role="menu"
            className={`${menuPosition} overflow-hidden rounded-lg border border-white/15 bg-ink py-1 shadow-lg ring-1 ring-black/40`}
          >
            {canNativeShare && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-right text-sm text-cream transition hover:bg-white/10"
                onClick={nativeShare}
              >
                <ShareIcon className="size-4 shrink-0 opacity-80" />
                اشتراک‌گذاری
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-right text-sm text-cream transition hover:bg-white/10"
              onClick={copyLink}
            >
              <CopyIcon className="size-4 shrink-0 opacity-80" />
              کپی لینک
            </button>
          </div>
        )}
      </div>
      {hint && (
        <span
          className={`pointer-events-none rounded-md bg-ink/90 px-2 py-0.5 text-[10px] text-cream ring-1 ring-white/15 ${
            variant === "overlay" ? "self-center" : "absolute -top-8 left-0 z-30 whitespace-nowrap"
          }`}
          role="status"
        >
          {hint}
        </span>
      )}
    </div>
  );
}

function ShareIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle cx="18" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8.2 11 15.5 6.5M8.2 13l7.3 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
