import Link from "next/link";
import { EnamadSeal } from "@/components/EnamadSeal";
import { business } from "@/lib/business";
import { site } from "@/lib/site";

const legalLinks = [
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/terms", label: "قوانین و مقررات" },
  { href: "/privacy", label: "حریم خصوصی" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-surface/30 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium text-cream">{business.legalName}</p>
          <p className="mt-1 text-xs text-muted">{site.description}</p>
        </div>
        <nav
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted"
          aria-label="صفحات قانونی"
        >
          {legalLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <EnamadSeal />
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-right text-xs text-muted">
        {site.footerCredit}
      </p>
    </footer>
  );
}
