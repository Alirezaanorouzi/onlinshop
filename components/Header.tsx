"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCollections, getProducts } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatNumber } from "@/lib/format";
import { useSearch } from "@/lib/search";
import { site } from "@/lib/site";

const collections = getCollections();

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { query, setQuery, open, setOpen } = useSearch();
  const activeCollection = collections.find((collection) =>
    pathname.startsWith(`/collection/${collection.slug}`),
  )?.slug;
  const results = query.trim()
    ? getProducts({ collection: activeCollection, query }).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-8">
        <Link href="/collection/men" className="shrink-0 text-lg font-semibold">
          {site.name}
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          {collections.map((collection) => {
            const active = pathname.startsWith(
              `/collection/${collection.slug}`,
            );
            return (
              <Link
                key={collection.slug}
                href={`/collection/${collection.slug}`}
                className={
                  active
                    ? "shrink-0 border-b-2 border-gold pb-1 text-cream"
                    : "shrink-0 pb-1 hover:text-cream"
                }
                onClick={() => setQuery("")}
              >
                {collection.nav}
              </Link>
            );
          })}
        </nav>
        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="grid size-9 place-items-center text-cream/80"
            aria-label="حساب کاربری"
            title="حساب کاربری به‌زودی"
          >
            <UserIcon />
          </button>
          <div className="relative">
            <button
              type="button"
              className="grid size-9 place-items-center text-cream/80"
              aria-label="جستجو"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <SearchIcon />
            </button>
            {open && (
              <div className="absolute end-0 top-11 z-50 w-64 border border-white/10 bg-elevated p-3 shadow-xl">
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="نام محصول"
                  className="w-full border-b border-gold/70 bg-transparent pb-2 text-sm outline-none placeholder:text-muted"
                />
                {query.trim() && (
                  <ul className="mt-2 max-h-64 overflow-auto">
                    {results.length === 0 && (
                      <li className="px-1 py-2 text-sm text-muted">
                        محصولی پیدا نشد
                      </li>
                    )}
                    {results.map((product) => (
                      <li key={product.slug}>
                        <Link
                          href={`/product/${product.slug}`}
                          className="block px-1 py-2 text-sm hover:text-gold"
                          onClick={() => setOpen(false)}
                        >
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <Link
            href="/cart"
            className="relative grid size-9 place-items-center text-cream/80"
            aria-label="سبد خرید"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -top-0.5 -start-0.5 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] leading-4 text-ink">
                {formatNumber(count)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
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
