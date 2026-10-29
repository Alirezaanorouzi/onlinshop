"use client";

import { useEffect, useMemo, useState } from "react";
import { apiPath } from "@/lib/api-path";
import { linesToAutoRemoveFromCart } from "@/lib/cart-validation";
import { useCart } from "@/lib/cart";
import { removeFromCheckoutSelection } from "@/lib/checkout-selection-storage";
import type { CartLine, Product } from "@/lib/types";

/**
 * Loads catalog rows for cart slugs and removes lines for deleted/invalid products.
 */
export function useCartCatalogSync(lines: CartLine[]) {
  const { removeItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [prunedCount, setPrunedCount] = useState(0);

  const slugsKey = useMemo(
    () => [...new Set(lines.map((line) => line.productSlug))].join(","),
    [lines],
  );

  useEffect(() => {
    if (!slugsKey) {
      setProducts([]);
      setProductsLoading(false);
      setCatalogLoaded(true);
      setFetchError(false);
      return;
    }
    setProductsLoading(true);
    setCatalogLoaded(false);
    setFetchError(false);
    let cancelled = false;
    fetch(apiPath(`/api/products?slugs=${encodeURIComponent(slugsKey)}`))
      .then((response) => {
        if (!response.ok) throw new Error("fetch failed");
        return response.json();
      })
      .then((data: { products?: Product[] }) => {
        if (cancelled) return;
        setProducts(data.products ?? []);
        setCatalogLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true);
          setCatalogLoaded(true);
        }
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slugsKey]);

  useEffect(() => {
    if (!catalogLoaded || fetchError || lines.length === 0) return;
    const stale = linesToAutoRemoveFromCart(lines, products);
    if (stale.length === 0) return;
    removeItems(stale);
    removeFromCheckoutSelection(stale);
    setPrunedCount((count) => count + stale.length);
  }, [catalogLoaded, fetchError, lines, products, removeItems]);

  const bySlug = useMemo(
    () => new Map(products.map((product) => [product.slug, product])),
    [products],
  );

  return {
    products,
    bySlug,
    productsLoading,
    catalogLoaded,
    fetchError,
    prunedCount,
  };
}
