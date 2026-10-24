import { Suspense } from "react";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-20 text-center text-sm text-muted">در حال بارگذاری…</p>
      }
    >
      <AdminGate>
        <div className="min-h-[60vh] bg-ink">
          <AdminNav />
          {children}
        </div>
      </AdminGate>
    </Suspense>
  );
}
