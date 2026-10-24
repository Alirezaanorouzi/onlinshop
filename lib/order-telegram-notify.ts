import "server-only";

import { getProductsBySlugs } from "@/lib/catalog-db";
import { formatNumber, formatPrice } from "@/lib/format";
import { getOrderWithItems } from "@/lib/orders-db";
import { getPaymentByAuthority } from "@/lib/payments-db";
import { isTelegramNotifyEnabled, sendTelegramMessage } from "@/lib/telegram";
import type { CartLine } from "@/lib/types";

function formatCartLines(lines: CartLine[]): string {
  if (lines.length === 0) return "—";
  const slugs = [...new Set(lines.map((line) => line.productSlug))];
  const bySlug = new Map(
    getProductsBySlugs(slugs).map((product) => [product.slug, product.name]),
  );
  return lines
    .map((line) => {
      const name = bySlug.get(line.productSlug) ?? line.productSlug;
      return `• ${name} — ${line.size} / ${line.color} × ${formatNumber(line.quantity)}`;
    })
    .join("\n");
}

function formatOrderItems(
  items: {
    productName: string;
    size: string;
    color: string;
    quantity: number;
    unitPriceTomans: number;
  }[],
): string {
  if (items.length === 0) return "—";
  return items
    .map(
      (line) =>
        `• ${line.productName} — ${line.size} / ${line.color} × ${formatNumber(line.quantity)} (${formatPrice(line.unitPriceTomans * line.quantity)})`,
    )
    .join("\n");
}

export async function notifyOwnerOrderPaid(
  authority: string,
  refId: string,
): Promise<void> {
  if (!isTelegramNotifyEnabled()) return;

  const payment = getPaymentByAuthority(authority);
  if (!payment) return;

  const lines: string[] = [
    "✅ سفارش جدید — پرداخت موفق",
    "",
    `مبلغ: ${formatPrice(payment.amountTomans)}`,
    `کد پیگیری زرین‌پال: ${refId}`,
  ];

  if (payment.orderId) {
    const bundle = getOrderWithItems(payment.orderId);
    if (bundle) {
      lines.push("", `شماره سفارش: #${formatNumber(bundle.order.id)}`);
      lines.push(`نام: ${bundle.order.shippingFullName}`);
      lines.push(`موبایل: ${bundle.order.shippingPhone}`);
      if (bundle.order.shippingCity) {
        lines.push(`شهر: ${bundle.order.shippingCity}`);
      }
      lines.push(`آدرس: ${bundle.order.shippingAddress}`);
      if (bundle.order.shippingPostalCode) {
        lines.push(`کد پستی: ${bundle.order.shippingPostalCode}`);
      }
      lines.push("", "اقلام:", formatOrderItems(bundle.items));
    }
  } else if (payment.shipping) {
    lines.push("", `نام: ${payment.shipping.fullName}`);
    lines.push(`موبایل: ${payment.shipping.phone}`);
    if (payment.shipping.city) lines.push(`شهر: ${payment.shipping.city}`);
    lines.push(`آدرس: ${payment.shipping.address}`);
    if (payment.shipping.postalCode) {
      lines.push(`کد پستی: ${payment.shipping.postalCode}`);
    }
    lines.push("", "اقلام:", formatCartLines(payment.cart));
  } else {
    lines.push("", "اقلام:", formatCartLines(payment.cart));
    if (payment.mobile) lines.push(`موبایل: ${payment.mobile}`);
  }

  await sendTelegramMessage(lines.join("\n"));
}
