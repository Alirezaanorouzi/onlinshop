import { getSessionUser } from "@/lib/auth-session";
import { isSqliteCatalog } from "@/lib/env";
import {
  getPaymentByAuthority,
  markPaymentFailed,
  markPaymentPaid,
} from "@/lib/payments-db";
import { isSnappPayConfigured, snappPayVerifyAndSettle } from "@/lib/snapppay";

type Body = { paymentToken?: string };

export async function POST(request: Request) {
  if (!isSnappPayConfigured() || !isSqliteCatalog()) {
    return Response.json({ error: "درگاه غیرفعال" }, { status: 503 });
  }

  const body = (await request.json()) as Body;
  const paymentToken = body.paymentToken?.trim();
  if (!paymentToken) {
    return Response.json({ error: "توکن پرداخت نامعتبر" }, { status: 400 });
  }

  const payment = getPaymentByAuthority(paymentToken);
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
    const { transactionId } = await snappPayVerifyAndSettle(paymentToken);
    markPaymentPaid(paymentToken, transactionId);

    return Response.json({
      ok: true,
      refId: transactionId,
      amountTomans: payment.amountTomans,
    });
  } catch (err) {
    markPaymentFailed(paymentToken);
    const message = err instanceof Error ? err.message : "تأیید ناموفق";
    return Response.json({ error: message }, { status: 400 });
  }
}
