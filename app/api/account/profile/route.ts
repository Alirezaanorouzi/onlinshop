import { getSessionUser } from "@/lib/auth-session";
import {
  getCustomerProfile,
  isProfileComplete,
  updateCustomerProfile,
} from "@/lib/customer-profile";
import { isSqliteCatalog } from "@/lib/env";
import { runMigrations } from "@/lib/migrate";

export async function GET(request: Request) {
  if (!isSqliteCatalog()) {
    return Response.json({ error: "غیرفعال" }, { status: 503 });
  }
  runMigrations();

  const session = getSessionUser(request);
  if (!session || session.role !== "customer") {
    return Response.json({ error: "ورود با موبایل لازم است." }, { status: 401 });
  }

  const profile = getCustomerProfile(session.id);
  if (!profile) {
    return Response.json({ error: "حساب یافت نشد." }, { status: 404 });
  }

  return Response.json({
    profile,
    complete: isProfileComplete(profile),
  });
}

type Body = {
  fullName?: string;
  address?: string;
  postalCode?: string;
  city?: string;
};

export async function PATCH(request: Request) {
  if (!isSqliteCatalog()) {
    return Response.json({ error: "غیرفعال" }, { status: 503 });
  }
  runMigrations();

  const session = getSessionUser(request);
  if (!session || session.role !== "customer") {
    return Response.json({ error: "ورود با موبایل لازم است." }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  try {
    const profile = updateCustomerProfile(session.id, {
      fullName: body.fullName ?? "",
      address: body.address ?? "",
      postalCode: body.postalCode ?? "",
      city: body.city,
    });
    if (!profile) {
      return Response.json({ error: "به‌روزرسانی ناموفق" }, { status: 500 });
    }
    return Response.json({
      profile,
      complete: isProfileComplete(profile),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطا";
    return Response.json({ error: message }, { status: 400 });
  }
}
