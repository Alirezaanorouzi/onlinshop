import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "مدیریت",
  ...noIndexMetadata(),
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
