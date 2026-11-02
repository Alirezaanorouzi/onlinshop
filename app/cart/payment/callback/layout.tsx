import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "نتیجه پرداخت",
  ...noIndexMetadata(),
};

export default function PaymentCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
