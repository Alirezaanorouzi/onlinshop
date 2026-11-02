import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "ورود",
  ...noIndexMetadata(),
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
