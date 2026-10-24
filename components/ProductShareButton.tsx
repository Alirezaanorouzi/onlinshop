"use client";

import { useCallback, useState } from "react";
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
}: {
  slug: string;
  productName: string;
  className?: string;
}) {
  const [hint, setHint] = useState<string | null>(null);

  const share = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const url = buildShareUrl(slug);

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: productName,
            text: productName,
            url,
          });
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }

      try {
        await navigator.clipboard.writeText(url);
        setHint("کپی شد");
      } catch {
        setHint("خطا");
      }
      window.setTimeout(() => setHint(null), 2000);
    },
    [slug, productName],
  );

  return (
    <div
      className={`pointer-events-none absolute bottom-2 left-2 z-10 flex items-center gap-2 ${className}`}
    >
      <button
        type="button"
        className="pointer-events-auto grid size-8 place-items-center rounded-full bg-ink/75 text-cream ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-ink hover:text-gold"
        aria-label={`اشتراک‌گذاری ${productName}`}
        title="اشتراک‌گذاری لینک محصول"
        onClick={share}
      >
        <ShareIcon />
      </button>
      {hint && (
        <span
          className="pointer-events-none ms-2 self-center rounded-md bg-ink/90 px-2 py-0.5 text-[10px] text-cream ring-1 ring-white/15"
          role="status"
        >
          {hint}
        </span>
      )}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
