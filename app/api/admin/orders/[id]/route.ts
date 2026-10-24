import { assertAdmin } from "@/lib/admin-auth";
import { setOrderShipped } from "@/lib/orders-db";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertAdmin(request);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  const { id: idParam } = await context.params;
  const orderId = Number.parseInt(idParam, 10);
  if (!Number.isFinite(orderId) || orderId < 1) {
    return Response.json({ error: "invalid order id" }, { status: 400 });
  }

  let body: { shipped?: boolean };
  try {
    body = (await request.json()) as { shipped?: boolean };
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  if (typeof body.shipped !== "boolean") {
    return Response.json({ error: "shipped boolean required" }, { status: 400 });
  }

  try {
    setOrderShipped(orderId, body.shipped);
  } catch (err) {
    const message = err instanceof Error ? err.message : "update failed";
    return Response.json({ error: message }, { status: 400 });
  }

  return Response.json({ ok: true, shipped: body.shipped });
}
