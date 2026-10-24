import { getAdminToken } from "@/lib/env";
import { getSessionUser } from "@/lib/auth-session";

export function isAdminSession(request: Request): boolean {
  const user = getSessionUser(request);
  return user?.role === "admin";
}

export function assertAdmin(request: Request) {
  if (isAdminSession(request)) return;

  const token = getAdminToken();
  if (!token) {
    throw new Response("Admin API disabled (set ADMIN_TOKEN or create admin user)", {
      status: 503,
    });
  }

  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const alt = request.headers.get("x-admin-token");

  if (bearer !== token && alt !== token) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
