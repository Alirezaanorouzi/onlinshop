/** Shown in «قیمت و مشخصات» on every product page. */
export const PRODUCT_WARRANTY =
  "ضمانت کیفیت و سلامت فیزیکی کالا";

/** Customer-facing code (DB id): at least 3 digits, e.g. 001, 042, 1001. */
export function formatProductCode(code: number): string {
  if (!Number.isFinite(code) || code < 1) return "—";
  if (code < 1000) return code.toString().padStart(3, "0");
  return String(code);
}
