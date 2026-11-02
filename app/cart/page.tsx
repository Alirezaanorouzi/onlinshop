import { CartView } from "@/components/CartView";
import { noIndexMetadata } from "@/lib/seo/site";

export const metadata = {
  title: "سبد خرید / پیش‌فاکتور",
  description: "مشاهده اقلام سفارش، جمع کل و اطلاعات پیش از پرداخت",
  ...noIndexMetadata(),
};

export default function CartPage() {
  return <CartView />;
}
