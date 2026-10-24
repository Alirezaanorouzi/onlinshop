"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountHeaderLink } from "@/components/AccountHeaderLink";
import { apiPath } from "@/lib/api-path";
import { getCollections } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { formatNumber } from "@/lib/format";
import { useSearch } from "@/lib/search";
import { site } from "@/lib/site";

const collections = getCollections();

const collectionShortLabel: Record<string, string> = {
  men: "آقایان",
  women: "بانوان",
};

export function Header({ minimal = false }: { minimal?: boolean }) {
  const pathname = usePathname();
  const { count } = useCart();
  const { query, setQuery, open, setOpen } = useSearch();
  const activeCollection = collections.find((collection) =>
    pathname.includes(`/collection/${collection.slug}`),
  )?.slug;
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    const needle = query.trim();
    if (!needle) {
      setResults([]);
      return;
    }

    const params = new URLSearchParams({ query: needle });
    if (activeCollection) params.set("collection", activeCollection);

    const timer = window.setTimeout(() => {
      fetch(apiPath(`/api/products?${params}`))
        .then((response) => response.json())
        .then((data: { products?: Product[] }) => {
          setResults((data.products ?? []).slice(0, 6));
        })
        .catch(() => setResults([]));
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query, activeCollection]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const toolbarOffset =
    "calc(3.5rem + env(safe-area-inset-top, 0px))";

  if (minimal) {
    return (
      <header className="relative">
        <div
          className="fixed inset-x-0 top-0 z-[60] border-b border-white/10 bg-ink/95 backdrop-blur supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]"
        >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-4">
          <Link
            href="/collection/men"
            className="min-w-0 truncate text-base font-semibold sm:text-lg"
          >
            {site.name}
          </Link>
          <Link
            href="/collection/men"
            className="shrink-0 text-sm text-muted hover:text-gold"
          >
            فروشگاه
          </Link>
        </div>
        </div>
        <div className="h-14 sm:h-16" aria-hidden />
      </header>
    );
  }

  return (
    <header className="relative isolate">
      <div
        className="fixed inset-x-0 top-0 z-[60] border-b border-white/10 bg-ink/95 backdrop-blur supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]"
      >
      <div className="relative mx-auto max-w-6xl px-3 sm:px-4">
        <div className="relative z-[62] flex h-14 items-center gap-2 sm:h-16 sm:gap-4">
          <Link
            href="/collection/men"
            className="min-w-0 shrink truncate text-base font-semibold sm:text-lg"
            prefetch={true}
          >
            {site.name}
          </Link>

          <nav
            className="hidden min-w-0 items-center gap-4 overflow-x-auto text-sm text-muted md:flex"
            aria-label="کالکشن‌ها"
          >
            {collections.map((collection) => {
              const active = pathname.includes(
                `/collection/${collection.slug}`,
              );
              return (
                <CollectionLink
                  key={collection.slug}
                  collection={collection}
                  active={active}
                  label={collection.nav}
                  onNavigate={() => setQuery("")}
                />
              );
            })}
          </nav>

          <div className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
            <AccountHeaderLink />
            <button
              type="button"
              className="grid size-11 place-items-center text-cream/80 hover:text-gold"
              aria-label="جستجو"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <SearchIcon />
            </button>
            <Link
              href="/cart"
              prefetch={true}
              className="relative grid size-11 place-items-center text-cream/80 hover:text-gold"
              aria-label="سبد خرید"
            >
              <CartIcon />
              {count > 0 && (
                <span className="absolute top-1 start-1 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] leading-4 text-ink">
                  {formatNumber(count)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 z-[55] bg-black/50 md:hidden"
            style={{ top: toolbarOffset }}
            aria-label="بستن جستجو"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed inset-x-3 top-[calc(3.5rem+env(safe-area-inset-top,0px)+0.5rem)] z-[56] rounded-xl border border-white/10 bg-elevated p-3 shadow-xl sm:top-[calc(4rem+env(safe-area-inset-top,0px)+0.5rem)] md:absolute md:inset-x-auto md:end-3 md:top-full md:mt-2 md:w-72"
            role="search"
          >
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="نام محصول"
              className="w-full border-b border-gold/70 bg-transparent pb-2 text-base outline-none placeholder:text-muted"
            />
            {query.trim() && (
              <ul className="mt-2 max-h-[50vh] overflow-auto">
                {results.length === 0 && (
                  <li className="px-1 py-2 text-sm text-muted">
                    محصولی پیدا نشد
                  </li>
                )}
                {results.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/product/${product.slug}`}
                      className="block rounded-md px-2 py-2.5 text-sm hover:bg-white/5 hover:text-gold"
                      onClick={() => setOpen(false)}
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      </div>

      <div className="h-14 sm:h-16" aria-hidden />
      <div className="mx-auto max-w-6xl border-b border-white/10 px-3 md:hidden sm:px-4">
        <nav
          className="grid grid-cols-2 gap-2 py-2"
          aria-label="کالکشن‌ها"
        >
          {collections.map((collection) => {
            const active = pathname.includes(`/collection/${collection.slug}`);
            return (
              <CollectionLink
                key={collection.slug}
                collection={collection}
                active={active}
                label={
                  collectionShortLabel[collection.slug] ?? collection.nav
                }
                onNavigate={() => setQuery("")}
                mobile
              />
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function CollectionLink({
  collection,
  active,
  label,
  onNavigate,
  mobile = false,
}: {
  collection: { slug: string };
  active: boolean;
  label: string;
  onNavigate: () => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <Link
        href={`/collection/${collection.slug}`}
        onClick={onNavigate}
        className={
          active
            ? "rounded-lg bg-surface py-2.5 text-center text-sm font-medium text-cream ring-1 ring-gold/40"
            : "rounded-lg bg-surface/40 py-2.5 text-center text-sm text-muted"
        }
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={`/collection/${collection.slug}`}
      onClick={onNavigate}
      className={
        active
          ? "shrink-0 border-b-2 border-gold pb-1 text-cream"
          : "shrink-0 pb-1 hover:text-cream"
      }
    >
      {label}
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M16 16.5 L20 20.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
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
