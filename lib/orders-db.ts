import "server-only";

import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/index";
import { orderItems, orders, payments } from "@/db/schema";
import { getProductsBySlugs } from "@/lib/catalog-db";
import type { ShippingSnapshot } from "@/lib/shipping";
import type { CartLine } from "@/lib/types";

export type OrderStatus =
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "cancelled"
  | "failed";

export type CustomerOrderRow = {
  id: number;
  amountTomans: number;
  status: OrderStatus;
  refId: string | null;
  paymentAuthority: string | null;
  createdAt: Date;
  itemCount: number;
};

function now() {
  return new Date();
}

export function createOrderForCheckout(input: {
  userId: number;
  lines: CartLine[];
  amountTomans: number;
  shipping: ShippingSnapshot;
}): number {
  const slugs = [...new Set(input.lines.map((line) => line.productSlug))];
  const products = getProductsBySlugs(slugs);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const db = getDb();
  const created = db
    .insert(orders)
    .values({
      userId: input.userId,
      status: "awaiting_payment",
      amountTomans: input.amountTomans,
      shippingFullName: input.shipping.fullName,
      shippingPhone: input.shipping.phone,
      shippingCity: input.shipping.city,
      shippingAddress: input.shipping.address,
      shippingPostalCode: input.shipping.postalCode,
      createdAt: now(),
      updatedAt: now(),
    })
    .returning({ id: orders.id })
    .get();

  if (!created?.id) {
    throw new Error("ایجاد سفارش ناموفق بود.");
  }

  const orderId = created.id;
  for (const line of input.lines) {
    const product = bySlug.get(line.productSlug);
    if (!product) {
      throw new Error(`محصول نامعتبر: ${line.productSlug}`);
    }
    db.insert(orderItems)
      .values({
        orderId,
        productSlug: line.productSlug,
        productName: product.name,
        size: line.size,
        color: line.color,
        unitPriceTomans: product.price,
        quantity: line.quantity,
      })
      .run();
  }

  return orderId;
}

export function setOrderStatus(orderId: number, status: OrderStatus) {
  const db = getDb();
  db.update(orders)
    .set({ status, updatedAt: now() })
    .where(eq(orders.id, orderId))
    .run();
}

export function setOrderStatusByPaymentAuthority(
  authority: string,
  status: OrderStatus,
) {
  const db = getDb();
  const payment = db
    .select({ orderId: payments.orderId })
    .from(payments)
    .where(eq(payments.authority, authority))
    .get();
  if (payment?.orderId) {
    setOrderStatus(payment.orderId, status);
  }
}

export function getOrderWithItems(orderId: number) {
  const db = getDb();
  const order = db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .get();
  if (!order) return null;

  const items = db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .all();

  return { order, items };
}

const ADMIN_VISIBLE_STATUSES: OrderStatus[] = ["paid", "processing", "shipped"];

export type AdminOrderListItem = {
  id: number;
  amountTomans: number;
  status: OrderStatus;
  shippingFullName: string;
  shippingPhone: string;
  shippingCity: string;
  shippingAddress: string;
  shippingPostalCode: string;
  createdAt: Date;
  refId: string | null;
  items: {
    productSlug: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    unitPriceTomans: number;
  }[];
};

export function listOrdersForAdmin(limit = 80): AdminOrderListItem[] {
  const db = getDb();
  const orderRows = db
    .select()
    .from(orders)
    .where(inArray(orders.status, ADMIN_VISIBLE_STATUSES))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .all();

  return orderRows.map((order) => {
    const payment = db
      .select({ refId: payments.refId })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .get();

    const items = db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .all();

    return {
      id: order.id,
      amountTomans: order.amountTomans,
      status: order.status as OrderStatus,
      shippingFullName: order.shippingFullName,
      shippingPhone: order.shippingPhone,
      shippingCity: order.shippingCity,
      shippingAddress: order.shippingAddress,
      shippingPostalCode: order.shippingPostalCode,
      createdAt: order.createdAt,
      refId: payment?.refId ?? null,
      items: items.map((line) => ({
        productSlug: line.productSlug,
        productName: line.productName,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
        unitPriceTomans: line.unitPriceTomans,
      })),
    };
  });
}

export function setOrderShipped(orderId: number, shipped: boolean) {
  const bundle = getOrderWithItems(orderId);
  if (!bundle) throw new Error("سفارش پیدا نشد");
  if (!ADMIN_VISIBLE_STATUSES.includes(bundle.order.status as OrderStatus)) {
    throw new Error("این سفارش قابل به‌روزرسانی نیست");
  }
  setOrderStatus(orderId, shipped ? "shipped" : "paid");
}

export function listOrdersForUser(
  userId: number,
  limit = 50,
): CustomerOrderRow[] {
  const db = getDb();
  const orderRows = db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .all();

  return orderRows.map((order) => {
    const payment = db
      .select({
        refId: payments.refId,
        authority: payments.authority,
      })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .get();

    const items = db
      .select({ quantity: orderItems.quantity })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .all();

    const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);

    return {
      id: order.id,
      amountTomans: order.amountTomans,
      status: order.status as OrderStatus,
      refId: payment?.refId ?? null,
      paymentAuthority: payment?.authority ?? null,
      createdAt: order.createdAt,
      itemCount,
    };
  });
}
