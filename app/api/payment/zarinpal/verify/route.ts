import { getSessionUser } from "@/lib/auth-session";
import { isSqliteCatalog } from "@/lib/env";
import {
  getPaymentByAuthority,
  markPaymentFailed,
  markPaymentPaid,
} from "@/lib/payments-db";
import { isZarinpalConfigured, zarinpalVerifyPayment } from "@/lib/zarinpal";

type Body = { authority?: string };

export async function POST(request: Request) {
  if (!isZarinpalConfigured() || !isSqliteCatalog()) {
    return Response.json({ error: "درگاه غیرفعال" }, { status: 503 });
  }

  const body = (await request.json()) as Body;
  const authority = body.authority?.trim();
  if (!authority) {
    return Response.json({ error: "Authority نامعتبر" }, { status: 400 });
  }

  const payment = getPaymentByAuthority(authority);
  if (!payment) {
    return Response.json({ error: "تراکنش یافت نشد" }, { status: 404 });
  }

  const session = getSessionUser(request);
  if (
    payment.userId &&
    session &&
    payment.userId !== session.id
  ) {
    return Response.json({ error: "دسترسی به این تراکنش مجاز نیست" }, { status: 403 });
  }

  if (payment.status === "paid" && payment.refId) {
    return Response.json({
      ok: true,
      refId: payment.refId,
      amountTomans: payment.amountTomans,
      alreadyVerified: true,
    });
  }

  try {
    const { refId } = await zarinpalVerifyPayment({
      authority,
      amountTomans: payment.amountTomans,
    });

    markPaymentPaid(authority, String(refId));

    return Response.json({
      ok: true,
      refId: String(refId),
      amountTomans: payment.amountTomans,
    });
  } catch (err) {
    markPaymentFailed(authority);
    const message = err instanceof Error ? err.message : "تأیید ناموفق";
    return Response.json({ error: message }, { status: 400 });
  }
}
