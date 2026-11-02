import type { Metadata } from "next";
import { CheckoutView } from "@/components/CheckoutView";
import { noIndexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "تسویه حساب",
  ...noIndexMetadata(),
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
