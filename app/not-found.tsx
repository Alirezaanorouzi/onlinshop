import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24">
      <h1 className="text-3xl font-semibold">صفحه پیدا نشد</h1>
      <Link href="/collection/men" className="mt-6 inline-block text-sm text-gold">
        بازگشت به فروشگاه
      </Link>
    </div>
  );
}
