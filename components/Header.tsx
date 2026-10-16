"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getCollections, getProducts } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatNumber } from "@/lib/format";
import { useSearch } from "@/lib/search";
import { site } from "@/lib/site";

const collections = getCollections();

const collectionShortLabel: Record<string, string> = {
  men: "آقایان",
  women: "بانوان",
};

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { query, setQuery, open, setOpen } = useSearch();
  const activeCollection = collections.find((collection) =>
    pathname.includes(`/collection/${collection.slug}`),
  )?.slug;
  const results = query.trim()
    ? getProducts({ collection: activeCollection, query }).slice(0, 6)
    : [];

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

  return (
    <header
      className="relative sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]"
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex h-14 items-center gap-2 sm:h-16 sm:gap-4">
          <Link
            href="/collection/men"
            className="min-w-0 shrink truncate text-base font-semibold sm:text-lg"
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
            <button
              type="button"
              className="hidden size-11 place-items-center text-cream/80 sm:grid"
              aria-label="حساب کاربری"
              title="حساب کاربری به‌زودی"
            >
              <UserIcon />
            </button>
            <button
              type="button"
              className="grid size-11 place-items-center text-cream/80"
              aria-label="جستجو"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <SearchIcon />
            </button>
            <Link
              href="/cart"
              className="relative grid size-11 place-items-center text-cream/80"
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

        <nav
          className="grid grid-cols-2 gap-2 border-t border-white/10 py-2 md:hidden"
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

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[45] bg-black/50 md:hidden"
            aria-label="بستن جستجو"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed inset-x-3 top-[calc(7.5rem+env(safe-area-inset-top,0px))] z-50 rounded-xl border border-white/10 bg-elevated p-3 shadow-xl md:absolute md:inset-x-auto md:end-3 md:top-full md:mt-2 md:w-72"
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

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19.2c1.4-3 3.8-4.4 7-4.4s5.6 1.4 7 4.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
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
