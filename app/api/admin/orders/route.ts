import { assertAdmin } from "@/lib/admin-auth";
import {
  isOrderShipped,
  orderShipmentLabel,
  resolveOrderColorLabel,
} from "@/lib/order-display";
import { listOrdersForAdmin } from "@/lib/orders-db";

export async function GET(request: Request) {
  try {
    assertAdmin(request);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  const orders = listOrdersForAdmin().map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    shipmentLabel: orderShipmentLabel(order.status),
    shipped: isOrderShipped(order.status),
    items: order.items.map((item) => ({
      ...item,
      colorLabel: resolveOrderColorLabel(item.productSlug, item.color),
    })),
  }));

  return Response.json({ orders });
}
