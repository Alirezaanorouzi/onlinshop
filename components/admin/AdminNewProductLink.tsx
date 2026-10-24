import Link from "next/link";

export function AdminNewProductLink() {
  return (
    <Link
      href="/admin/products/new"
      className="inline-flex items-center gap-1 rounded-lg bg-gold px-3 py-2 text-sm font-medium leading-none text-ink"
    >
      <PlusIcon />
      <span>محصول جدید</span>
    </Link>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
