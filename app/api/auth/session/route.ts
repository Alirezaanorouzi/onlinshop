import { getSessionUser } from "@/lib/auth-session";

export function GET(request: Request) {
  const user = getSessionUser(request);
  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }
  return Response.json({
    user: {
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
}
