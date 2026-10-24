import { getSessionUser } from "@/lib/auth-session";
import { isSqliteCatalog } from "@/lib/env";
import { runMigrations } from "@/lib/migrate";
import { listOrdersForUser } from "@/lib/orders-db";

export async function GET(request: Request) {
  if (!isSqliteCatalog()) {
    return Response.json({ error: "غیرفعال" }, { status: 503 });
  }
  runMigrations();

  const session = getSessionUser(request);
  if (!session || session.role !== "customer") {
    return Response.json({ error: "ورود با موبایل لازم است." }, { status: 401 });
  }

  const orders = listOrdersForUser(session.id).map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }));

  return Response.json({ orders });
}
