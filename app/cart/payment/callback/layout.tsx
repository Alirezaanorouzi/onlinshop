import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "نتیجه پرداخت",
};

export default function PaymentCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
