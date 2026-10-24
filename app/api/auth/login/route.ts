import { sessionCookieHeader } from "@/lib/auth-cookie";
import { createSession, sessionMaxAgeSeconds } from "@/lib/auth-session";
import { verifyUserPassword } from "@/lib/auth-users";
import { isSqliteCatalog } from "@/lib/env";
import { runMigrations } from "@/lib/migrate";

export async function POST(request: Request) {
  if (!isSqliteCatalog()) {
    return Response.json(
      { error: "ورود با ایمیل فقط با CATALOG_BACKEND=sqlite فعال است." },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  runMigrations();

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return Response.json(
      { error: "ایمیل و رمز عبور را وارد کنید" },
      { status: 400 },
    );
  }

  const user = verifyUserPassword(email, password);
  if (!user || user.role !== "admin") {
    return Response.json(
      { error: "ایمیل یا رمز عبور اشتباه است" },
      { status: 401 },
    );
  }

  const sessionId = createSession(user.id);
  return Response.json(
    { ok: true, user: { email: user.email, role: user.role } },
    {
      headers: {
        "Set-Cookie": sessionCookieHeader(sessionId, sessionMaxAgeSeconds()),
      },
    },
  );
}
