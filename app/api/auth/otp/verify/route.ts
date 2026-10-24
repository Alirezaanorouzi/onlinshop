import { sessionCookieHeader } from "@/lib/auth-cookie";
import { createSession, sessionMaxAgeSeconds } from "@/lib/auth-session";
import { findOrCreateUserByPhone } from "@/lib/otp-login-user";
import { isSqliteCatalog } from "@/lib/env";
import { runMigrations } from "@/lib/migrate";
import { verifyOtpCode } from "@/lib/otp-auth";

type Body = { phone?: string; code?: string };

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
  const code = body.code?.trim() ?? "";
  if (!phone || !code) {
    return Response.json(
      { error: "شماره موبایل و کد تأیید را وارد کنید." },
      { status: 400 },
    );
  }

  const verified = verifyOtpCode(phone, code);
  if (!verified.ok) {
    return Response.json({ error: verified.error }, { status: 401 });
  }

  const account = findOrCreateUserByPhone(verified.phone);
  if (!account.ok) {
    return Response.json({ error: account.error }, { status: 403 });
  }

  const sessionId = createSession(account.user.id);
  const displayPhone = account.user.phone ?? verified.phone;

  return Response.json(
    {
      ok: true,
      user: {
        phone: displayPhone,
        email: account.user.email,
        role: account.user.role,
      },
    },
    {
      headers: {
        "Set-Cookie": sessionCookieHeader(sessionId, sessionMaxAgeSeconds()),
      },
    },
  );
}
