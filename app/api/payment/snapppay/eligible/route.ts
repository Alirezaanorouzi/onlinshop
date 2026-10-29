import { isSqliteCatalog } from "@/lib/env";
import {
  isSnappPayAmountInEligibleRange,
  isSnappPayConfigured,
  snappPayEligible,
  tomansToRials,
} from "@/lib/snapppay";

export async function GET(request: Request) {
  if (!isSnappPayConfigured() || !isSqliteCatalog()) {
    return Response.json({ eligible: false, enabled: false });
  }

  const url = new URL(request.url);
  const amountTomans = Math.floor(Number(url.searchParams.get("amountTomans")));
  if (!Number.isFinite(amountTomans) || amountTomans < 100) {
    return Response.json({ eligible: false, enabled: true });
  }

  const amountRials = tomansToRials(amountTomans);

  if (!isSnappPayAmountInEligibleRange(amountTomans)) {
    return Response.json({
      enabled: true,
      eligible: false,
      amountTomans,
      amountRials,
      reason: "amount_out_of_range",
      hint:
        "در محیط Stage مبلغ باید بین ۴٬۰۰۰ تومان و ۱۰٬۰۰۰٬۰۰۰ تومان باشد (ارسال به اسنپ به ریال: amount × 10).",
    });
  }

  try {
    const result = await snappPayEligible(amountTomans);
    return Response.json({
      enabled: true,
      amountTomans,
      amountRials,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای اسنپ‌پی";
    return Response.json({
      enabled: true,
      eligible: false,
      amountTomans,
      amountRials,
      error: message,
    });
  }
}
