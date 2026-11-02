import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "حساب کاربری",
  ...noIndexMetadata(),
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
