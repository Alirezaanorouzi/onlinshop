import Link from "next/link";
import { site } from "@/lib/site";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <nav className="mb-8 text-sm text-muted">
        <Link href="/" className="hover:text-cream">
          {site.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-cream/90">{title}</span>
      </nav>
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      <div className="mt-8 space-y-6 text-sm leading-8 text-cream/85">
        {children}
      </div>
    </div>
  );
}
