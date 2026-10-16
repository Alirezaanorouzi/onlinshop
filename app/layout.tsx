import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { site } from "@/lib/site";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <div className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden w-1 bg-gold sm:block" />
        <Providers>
          <Suspense
            fallback={
              <div className="h-[7.5rem] border-b border-white/10 md:h-16" />
            }
          >
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-muted">
            {site.name}
          </footer>
        </Providers>
      </body>
    </html>
  );
}
