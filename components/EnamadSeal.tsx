import { getEnamadFooterHtml } from "@/lib/enamad";

/**
 * کد اینماد عیناً مطابق پنل (از ENAMAD_EMBED) — فقط در صورت وجود rel= حذف می‌شود.
 * استایل فقط روی wrapper است، نه روی تگ‌های داخل کد.
 */
export function EnamadSeal() {
  const html = getEnamadFooterHtml();

  return (
    <div
      className="enamad-seal-root inline-block shrink-0 [&_img]:h-[88px] [&_img]:w-auto sm:[&_img]:h-[100px]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
