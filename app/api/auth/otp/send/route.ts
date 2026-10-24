import { sendOtpToPhone } from "@/lib/otp-auth";
import { isSqliteCatalog } from "@/lib/env";
import { runMigrations } from "@/lib/migrate";

type Body = { phone?: string };

export async function POST(request: Request) {
  if (!isSqliteCatalog()) {
    return Response.json(
      { error: "ورود با موبایل فقط با CATALOG_BACKEND=sqlite فعال است." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  runMigrations();

  const phone = body.phone?.trim() ?? "";
  if (!phone) {
    return Response.json(
      { error: "شماره موبایل را وارد کنید." },
      { status: 400 },
    );
  }

  const result = await sendOtpToPhone(phone);
  if (!result.ok) {
    return Response.json(
      {
        error: result.error,
        retryAfterSeconds: result.retryAfterSeconds,
      },
      { status: result.retryAfterSeconds ? 429 : 400 },
    );
  }

  return Response.json({ ok: true });
}
