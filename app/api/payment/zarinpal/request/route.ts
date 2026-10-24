import { getSessionUser } from "@/lib/auth-session";
import {
  getCustomerProfile,
  isProfileComplete,
} from "@/lib/customer-profile";
import { isSqliteCatalog } from "@/lib/env";
import { calculateCartTotalTomans } from "@/lib/cart-total";
import { savePendingPayment } from "@/lib/payments-db";
import { getPublicSiteUrl } from "@/lib/site-url";
import { site } from "@/lib/site";
import { isZarinpalConfigured, zarinpalRequestPayment } from "@/lib/zarinpal";
import type { CartLine } from "@/lib/types";

type Body = {
  lines: CartLine[];
  email?: string;
};

export async function POST(request: Request) {
  if (!isZarinpalConfigured()) {
    return Response.json(
      { error: "درگاه زرین‌پال پیکربندی نشده است" },
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
  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (lines.length === 0) {
    return Response.json({ error: "حداقل یک قلم برای پرداخت انتخاب کنید." }, { status: 400 });
  }

  const mobile = profile.phone;

  const { total, error } = calculateCartTotalTomans(lines);
  if (error || total < 100) {
    return Response.json(
      { error: error ?? "حداقل مبلغ سفارش ۱۰۰ تومان است" },
      { status: 400 },
    );
  }

  const callbackUrl = `${getPublicSiteUrl(request)}/cart/payment/callback`;

  try {
    const { authority, redirectUrl } = await zarinpalRequestPayment({
      amountTomans: total,
      callbackUrl,
      description: `خرید از ${site.name}`,
      mobile,
      email: body.email?.trim(),
    });

    savePendingPayment({
      authority,
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
      redirectUrl,
      authority,
      amountTomans: total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای درگاه پرداخت";
    return Response.json({ error: message }, { status: 502 });
  }
}
