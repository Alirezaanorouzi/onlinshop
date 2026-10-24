import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { business } from "@/lib/business";
import { site } from "@/lib/site";

export const metadata = {
  title: "حریم خصوصی",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="سیاست حریم خصوصی">
      <p>
        {business.legalName} ({site.name}) به حفظ اطلاعات شخصی کاربران متعهد
        است. این سند توضیح می‌دهد چه داده‌هایی جمع‌آوری می‌شود و چگونه از آن
        استفاده می‌شود.
      </p>

      <section>
        <h2 className="text-lg font-medium text-cream">۱. داده‌های جمع‌آوری‌شده</h2>
        <ul className="mt-2 list-inside list-disc space-y-2">
          <li>
            <strong>حساب کاربری و ورود:</strong> ایمیل (برای مدیر)، و در آینده
            شماره موبایل برای مشتری در صورت فعال‌سازی ورود پیامکی.
          </li>
          <li>
            <strong>سفارش:</strong> نام، آدرس، تلفن و ایمیل هنگام ثبت یا
            هماهنگی سفارش (از طریق تماس یا فرم).
          </li>
          <li>
            <strong>فنی:</strong> کوکی نشست ورود (httpOnly)، و داده‌های سبد
            خرید در localStorage مرورگر شما.
          </li>
          <li>
            <strong>لاگ سرور:</strong> آدرس IP، زمان درخواست و خطاهای فنی برای
            امنیت و پایداری سرویس.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">۲. نحوه استفاده</h2>
        <ul className="mt-2 list-inside list-disc space-y-2">
          <li>پردازش و ارسال سفارش و پشتیبانی مشتری</li>
          <li>احراز هویت مدیر فروشگاه</li>
          <li>بهبود تجربه خرید و رفع اشکال فنی</li>
          <li>رعایت الزامات قانونی و درخواست مراجع ذی‌صلاح</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">۳. اشتراک‌گذاری</h2>
        <p className="mt-2">
          اطلاعات شخصی به اشخاص ثالث برای بازاریابی فروخته نمی‌شود. فقط
          شرکت‌های پست/حمل‌ونقل و درگاه پرداخت (در صورت استفاده) داده لازم
          برای انجام خدمت را دریافت می‌کنند.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">۴. نگهداری و امنیت</h2>
        <p className="mt-2">
          رمز عبور مدیر به‌صورت هش ذخیره می‌شود. ارتباط با سایت از طریق HTTPS
          انجام می‌شود. داده‌های سفارش تا مدت لازم برای حسابداری و قانون
          نگهداری می‌شوند.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">۵. حقوق شما</h2>
        <p className="mt-2">
          می‌توانید درخواست مشاهده، اصلاح یا حذف اطلاعات تماس خود را از طریق{" "}
          <Link href="/contact" className="text-gold hover:underline">
            تماس با ما
          </Link>{" "}
          ({business.email}) ثبت کنید.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">۶. کوکی‌ها</h2>
        <p className="mt-2">
          کوکی نشست برای ورود مدیر و حفظ وضعیت امنیتی استفاده می‌شود. مسدود
          کردن کوکی ممکن است برخی امکانات (مثل ورود به پنل) را محدود کند.
        </p>
      </section>

      <p className="text-xs text-muted">
        آخرین به‌روزرسانی: {new Date().toLocaleDateString("fa-IR")}
      </p>
    </LegalPage>
  );
}
