"use client";

import { useEffect } from "react";
import { useSearch } from "@/lib/search";

/** Toggles grid items by header search query without hydrating the product grid. */
export function ProductStripSearchFilter() {
  const { query } = useSearch();

  useEffect(() => {
    const needle = query.trim();
    const items = document.querySelectorAll<HTMLElement>(
      "[data-product-strip-item]",
    );
    let visible = 0;
    items.forEach((el) => {
      const name = el.getAttribute("data-product-name") ?? "";
      const show = !needle || name.includes(needle);
      el.classList.toggle("hidden", !show);
      if (show) visible += 1;
    });
    const countEl = document.querySelector("[data-product-strip-count]");
    if (countEl) countEl.textContent = `${visible.toLocaleString("fa-IR")} مورد`;
  }, [query]);

  return null;
}
