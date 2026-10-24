import { Suspense } from "react";

export default function NewProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-20 text-sm text-muted">در حال بارگذاری…</p>
      }
    >
      {children}
    </Suspense>
  );
}
