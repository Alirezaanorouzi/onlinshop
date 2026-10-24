import { eq } from "drizzle-orm";
import { payments } from "@/db/schema";
import { getDb } from "@/db/index";
import {
  createOrderForCheckout,
  setOrderStatusByPaymentAuthority,
} from "@/lib/orders-db";
import type { CartLine } from "@/lib/types";

export type PaymentStatus = "pending" | "paid" | "failed";

import type { ShippingSnapshot } from "@/lib/shipping";

export type { ShippingSnapshot };

export function savePendingPayment(input: {
  authority: string;
  amountTomans: number;
  cart: CartLine[];
  mobile?: string;
  userId?: number;
  shipping?: ShippingSnapshot;
}) {
  const db = getDb();

  let orderId: number | null = null;
  if (input.userId && input.shipping) {
    orderId = createOrderForCheckout({
      userId: input.userId,
      lines: input.cart,
      amountTomans: input.amountTomans,
      shipping: input.shipping,
    });
  }

  db.insert(payments)
    .values({
      authority: input.authority,
      orderId,
      amountTomans: input.amountTomans,
      cartJson: JSON.stringify(input.cart),
      status: "pending",
      mobile: input.mobile ?? null,
      userId: input.userId ?? null,
      shippingJson: input.shipping ? JSON.stringify(input.shipping) : null,
    })
    .run();
}

export function getPaymentByAuthority(authority: string) {
  const db = getDb();
  const row = db
    .select()
    .from(payments)
    .where(eq(payments.authority, authority))
    .get();

  if (!row) return undefined;

  let cart: CartLine[] = [];
  try {
    cart = JSON.parse(row.cartJson) as CartLine[];
  } catch {
    cart = [];
  }

  let shipping: ShippingSnapshot | null = null;
  if (row.shippingJson) {
    try {
      shipping = JSON.parse(row.shippingJson) as ShippingSnapshot;
    } catch {
      shipping = null;
    }
  }

  return {
    authority: row.authority,
    orderId: row.orderId,
    amountTomans: row.amountTomans,
    cart,
    status: row.status as PaymentStatus,
    refId: row.refId,
    mobile: row.mobile,
    userId: row.userId,
    shipping,
    createdAt: row.createdAt,
  };
}

export function markPaymentPaid(authority: string, refId: string) {
  const db = getDb();
  db.update(payments)
    .set({ status: "paid", refId })
    .where(eq(payments.authority, authority))
    .run();
  setOrderStatusByPaymentAuthority(authority, "paid");
}

export function markPaymentFailed(authority: string) {
  const db = getDb();
  db.update(payments)
    .set({ status: "failed" })
    .where(eq(payments.authority, authority))
    .run();
  setOrderStatusByPaymentAuthority(authority, "failed");
}
