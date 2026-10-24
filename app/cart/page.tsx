import { CartView } from "@/components/CartView";

export const metadata = {
  title: "سبد خرید / پیش‌فاکتور",
  description: "مشاهده اقلام سفارش، جمع کل و اطلاعات پیش از پرداخت",
};

export default function CartPage() {
  return <CartView />;
}
