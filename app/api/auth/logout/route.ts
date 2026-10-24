import { clearSessionCookieHeader } from "@/lib/auth-cookie";
import { deleteSessionFromRequest } from "@/lib/auth-session";

export async function POST(request: Request) {
  deleteSessionFromRequest(request);
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": clearSessionCookieHeader() } },
  );
}
