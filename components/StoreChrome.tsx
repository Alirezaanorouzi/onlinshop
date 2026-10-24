"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import {
  hideStoreChrome,
  isMinimalStoreChrome,
} from "@/lib/store-chrome";

export function StoreChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const hidden = hideStoreChrome(pathname);
  const minimal = isMinimalStoreChrome(pathname);

  return (
    <>
      {!hidden && <Header minimal={minimal} />}
      <main className="flex-1">{children}</main>
      {!hidden && !minimal && <SiteFooter />}
    </>
  );
}
