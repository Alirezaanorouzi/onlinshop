import { getSessionUser } from "@/lib/auth-session";
import {
  getCustomerProfile,
  isProfileComplete,
} from "@/lib/customer-profile";
import { calculateCartTotalTomans, sanitizeCartLines } from "@/lib/cart-total";
import { isSqliteCatalog } from "@/lib/env";
import { savePendingPayment } from "@/lib/payments-db";
import { getPublicSiteUrl } from "@/lib/site-url";
import { buildSnappPayCartList } from "@/lib/snapppay-cart";
import { isSnappPayConfigured, snappPayRequestPayment } from "@/lib/snapppay";
import type { CartLine } from "@/lib/types";
import { randomBytes } from "node:crypto";

type Body = { lines: CartLine[] };

export async function POST(request: Request) {
  if (!isSnappPayConfigured()) {
    return Response.json(
      { error: "درگاه اسنپ‌پی پیکربندی نشده است" },
      { status: 503 },
    );
  }

  if (!isSqliteCatalog()) {
    return Response.json(
      { error: "پرداخت فقط با CATALOG_BACKEND=sqlite فعال است" },
      { status: 503 },
    );
  }

  const session = getSessionUser(request);
  if (!session || session.role !== "customer") {
    return Response.json(
      { error: "برای پرداخت ابتدا با شماره موبایل وارد شوید." },
      { status: 401 },
    );
  }

  const profile = getCustomerProfile(session.id);
  if (!profile || !isProfileComplete(profile) || !profile.phone) {
    return Response.json(
      {
        error:
          "لطفاً در حساب کاربری نام، آدرس و کد پستی را کامل کنید سپس دوباره پرداخت کنید.",
        code: "profile_incomplete",
      },
      { status: 400 },
    );
  }

  const body = (await request.json()) as Body;
  const rawLines = Array.isArray(body.lines) ? body.lines : [];
  const sanitized = sanitizeCartLines(rawLines);
  if ("error" in sanitized) {
    return Response.json({ error: sanitized.error }, { status: 400 });
  }
  const lines = sanitized;

  const mobile = profile.phone;

  const { total, error } = calculateCartTotalTomans(lines);
  if (error || total < 100) {
    return Response.json(
      { error: error ?? "حداقل مبلغ سفارش ۱۰۰ تومان است" },
      { status: 400 },
    );
  }

  const transactionId = `${Date.now()}-${session.id}-${randomBytes(4).toString("hex")}`;
  const cartId = Math.floor(Date.now() / 1000);

  let cartList;
  try {
    cartList = [buildSnappPayCartList({ lines, cartId })];
  } catch (err) {
    const message = err instanceof Error ? err.message : "سبد نامعتبر";
    return Response.json({ error: message }, { status: 400 });
  }

  const returnUrl = `${getPublicSiteUrl(request)}/cart/payment/callback?gateway=snapppay`;

  try {
    const { paymentToken, paymentPageUrl } = await snappPayRequestPayment({
      amountTomans: total,
      returnUrl,
      transactionId,
      mobile,
      cartList,
    });

    savePendingPayment({
      authority: paymentToken,
      amountTomans: total,
      cart: lines,
      mobile,
      userId: session.id,
      shipping: {
        fullName: profile.fullName,
        address: profile.address,
        postalCode: profile.postalCode,
        city: profile.city,
        phone: profile.phone,
      },
    });

    return Response.json({
      redirectUrl: paymentPageUrl,
      paymentToken,
      amountTomans: total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای درگاه پرداخت";
    return Response.json({ error: message }, { status: 502 });
  }
}
