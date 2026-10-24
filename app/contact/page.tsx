import { LegalPage } from "@/components/LegalPage";
import { business } from "@/lib/business";

export const metadata = {
  title: "تماس با ما",
};

export default function ContactPage() {
  return (
    <LegalPage title="تماس با ما">
      <p>
        برای پیگیری سفارش، مشاوره خرید یا هرگونه سؤال، از راه‌های زیر با{" "}
        <strong>{business.legalName}</strong> در ارتباط باشید.
      </p>
      <dl className="divide-y divide-white/10 rounded-xl border border-white/10">
        <div className="grid gap-1 px-4 py-4 sm:grid-cols-3">
          <dt className="text-muted">نام واحد صنفی / تجاری</dt>
          <dd className="sm:col-span-2 font-medium text-cream">
            {business.legalName}
          </dd>
        </div>
        <div className="grid gap-1 px-4 py-4 sm:grid-cols-3">
          <dt className="text-muted">آدرس</dt>
          <dd className="sm:col-span-2" dir="rtl">
            {business.address}
            {business.postalCode && (
              <span className="mt-1 block text-muted">
                کد پستی: {business.postalCode}
              </span>
            )}
            {business.city && (
              <span className="mt-1 block text-muted">{business.city}</span>
            )}
          </dd>
        </div>
        <div className="grid gap-1 px-4 py-4 sm:grid-cols-3">
          <dt className="text-muted">تلفن ثابت</dt>
          <dd className="sm:col-span-2" dir="ltr">
            <a
              href={`tel:${business.phoneLandline.replace(/\s/g, "")}`}
              className="text-gold hover:underline"
            >
              {business.phoneLandline}
            </a>
          </dd>
        </div>
        <div className="grid gap-1 px-4 py-4 sm:grid-cols-3">
          <dt className="text-muted">تلفن همراه</dt>
          <dd className="sm:col-span-2" dir="ltr">
            <a
              href={`tel:${business.phoneMobile.replace(/\s/g, "")}`}
              className="text-gold hover:underline"
            >
              {business.phoneMobile}
            </a>
          </dd>
        </div>
        <div className="grid gap-1 px-4 py-4 sm:grid-cols-3">
          <dt className="text-muted">ایمیل</dt>
          <dd className="sm:col-span-2" dir="ltr">
            <a
              href={`mailto:${business.email}`}
              className="text-gold hover:underline"
            >
              {business.email}
            </a>
          </dd>
        </div>
        <div className="grid gap-1 px-4 py-4 sm:grid-cols-3">
          <dt className="text-muted">ساعات پاسخ‌گویی</dt>
          <dd className="sm:col-span-2">{business.hours}</dd>
        </div>
      </dl>
    </LegalPage>
  );
}
