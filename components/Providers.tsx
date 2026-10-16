"use client";

import { CartProvider } from "@/lib/cart";
import { SearchProvider } from "@/lib/search";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SearchProvider>{children}</SearchProvider>
    </CartProvider>
  );
}
