import { isSqliteCatalog } from "@/lib/env";
import { isSnappPayConfigured, snappPayEligible } from "@/lib/snapppay";

export async function GET(request: Request) {
  if (!isSnappPayConfigured() || !isSqliteCatalog()) {
    return Response.json({ eligible: false, enabled: false });
  }

  const url = new URL(request.url);
  const amountTomans = Math.floor(Number(url.searchParams.get("amountTomans")));
  if (!Number.isFinite(amountTomans) || amountTomans < 100) {
    return Response.json({ eligible: false, enabled: true });
  }

  try {
    const result = await snappPayEligible(amountTomans);
    return Response.json({ enabled: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای اسنپ‌پی";
    return Response.json({ enabled: true, eligible: false, error: message });
  }
}
