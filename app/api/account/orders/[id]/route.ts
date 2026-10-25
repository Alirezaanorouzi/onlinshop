import { getSessionUser } from "@/lib/auth-session";
import { isSqliteCatalog } from "@/lib/env";
import { runMigrations } from "@/lib/migrate";
import { resolveOrderColorLabel } from "@/lib/order-display";
import { getCustomerOrderDetail } from "@/lib/orders-db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSqliteCatalog()) {
    return Response.json({ error: "غیرفعال" }, { status: 503 });
  }
  runMigrations();

  const session = getSessionUser(request);
  if (!session || session.role !== "customer") {
    return Response.json({ error: "ورود با موبایل لازم است." }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const orderId = Number.parseInt(idParam, 10);
  if (!Number.isFinite(orderId) || orderId < 1) {
    return Response.json({ error: "شناسه سفارش نامعتبر" }, { status: 400 });
  }

  const order = getCustomerOrderDetail(session.id, orderId);
  if (!order) {
    return Response.json({ error: "سفارش پیدا نشد" }, { status: 404 });
  }

  return Response.json({
    order: {
      ...order,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        colorLabel: resolveOrderColorLabel(item.productSlug, item.color),
      })),
    },
  });
}
