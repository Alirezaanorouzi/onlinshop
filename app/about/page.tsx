import { LegalPage } from "@/components/LegalPage";
import { business } from "@/lib/business";
import { site } from "@/lib/site";

export const metadata = {
  title: "درباره ما",
};

export default function AboutPage() {
  return (
    <LegalPage title="درباره ما">
      <section>
        <h2 className="text-lg font-medium text-cream">معرفی</h2>
        <p className="mt-2">
          <strong>{business.legalName}</strong> ({site.name}) {business.tagline}
        </p>
        <p className="mt-4">
          فعالیت ما در زمینه <strong>فروش اینترنتی پوشاک</strong> (آقایان و
          بانوان) است. تمامی محصولات با قیمت، تصویر و توضیحات روی سایت نمایش
          داده می‌شوند و سفارش از طریق سبد خرید و پیش‌فاکتور ثبت می‌شود.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-medium text-cream">ماهیت فعالیت</h2>
        <ul className="mt-2 list-inside list-disc space-y-2 text-muted">
          <li>عرضه و فروش پوشاک از طریق وب‌سایت</li>
          <li>ارسال به سراسر کشور طبق روش‌های اعلام‌شده در قوانین خرید</li>
          <li>پشتیبانی و پیگیری سفارش از طریق تلفن و ایمیل</li>
        </ul>
      </section>
    </LegalPage>
  );
}
