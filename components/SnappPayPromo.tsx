"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/catalog";

const INTERVAL_MS = 5000;

export function SnappPayPromo({ compact = false }: { compact?: boolean }) {
  const featured =
    getProducts({ collection: "men", category: "hoodie" })[0] ??
    getProducts({ collection: "men" })[0];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % 2);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  if (!featured) return null;

  const card = (
    <div
      className={`relative h-full min-h-[11rem] overflow-hidden rounded-3xl px-5 py-5 sm:min-h-[12.5rem] sm:px-6 sm:py-6 ${compact ? "" : "sm:px-8 sm:py-8"}`}
      aria-label="پیشنهاد پرداخت"
      aria-live="polite"
    >
      <div
        className="absolute inset-0 bg-gradient-to-l from-[#0066b8] via-[#0088d4] to-[#00a8e8]"
      />

      <div className="relative flex h-full min-h-[9.5rem] flex-row items-center gap-4 sm:gap-6">
        <div
          className={`absolute inset-0 flex flex-row items-center gap-4 px-5 transition-all duration-700 sm:gap-6 sm:px-6 ${
            index === 0
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-4 opacity-0"
          }`}
        >
          <div className="relative h-24 w-20 shrink-0 -rotate-6 overflow-hidden rounded-2xl bg-white/15 shadow-lg ring-2 ring-white/25 sm:h-28 sm:w-24">
            <Image
              src={featured.image}
              alt={featured.name}
              fill
              unoptimized
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="min-w-0 flex-1 text-white">
            <p className="text-xs font-medium text-white/85 sm:text-sm">اسنپ‌پی</p>
            <h2 className="mt-1 text-xl font-bold leading-snug sm:text-2xl">
              پرداخت در ۴ قسط
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/90">
              پرداخت ۴ قسطه با اسنپ‌پی · حضوری و آنلاین
            </p>
          </div>
        </div>

        <div
          className={`absolute inset-0 flex flex-row items-center gap-4 px-5 transition-all duration-700 sm:gap-6 sm:px-6 ${
            index === 1
              ? "translate-x-0 opacity-100"
              : "pointer-events-none -translate-x-4 opacity-0"
          }`}
        >
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white/15 ring-2 ring-white/25 sm:size-24">
            <BagIcon />
          </div>
          <div className="min-w-0 flex-1 text-white">
            <p className="text-xs font-medium text-white/85 sm:text-sm">قائم مقام</p>
            <h2 className="mt-1 text-xl font-bold leading-snug sm:text-2xl">
              الان بخر، بعدا پرداخت کن
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/90">
              خرید آسان با اقساط و پرداخت در زمان مناسب شما
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {[0, 1].map((dot) => (
          <button
            key={dot}
            type="button"
            aria-label={dot === 0 ? "اسنپ‌پی" : "الان بخر بعدا پرداخت کن"}
            onClick={() => setIndex(dot)}
            className={`h-1.5 rounded-full transition-all ${
              index === dot ? "w-6 bg-white" : "w-1.5 bg-white/45"
            }`}
          />
        ))}
      </div>
    </div>
  );

  if (compact) return card;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-10">
      {card}
    </section>
  );
}

function BagIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white"
      aria-hidden
    >
      <path
        d="M6 7h12l-1 11H7L6 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 7a3 3 0 0 1 6 0"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
