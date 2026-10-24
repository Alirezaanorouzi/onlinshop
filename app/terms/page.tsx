import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { business } from "@/lib/business";
import { site } from "@/lib/site";

export const metadata = {
  title: "قوانین و مقررات",
};

export default function TermsPage() {
  return (
    <LegalPage title="قوانین و مقررات خرید">
      <p>
        استفاده از وب‌سایت {site.name} و ثبت سفارش به منزله پذیرش شرایط زیر
        است. لطفاً قبل از خرید این صفحه را مطالعه کنید.
      </p>

      <section>
        <h2 className="text-lg font-medium text-cream">۱. ثبت سفارش و قیمت</h2>
        <p className="mt-2">
          قیمت‌ها به <strong>تومان</strong> و در صفحه هر محصول و سبد خرید
          نمایش داده می‌شوند. مبلغ نهایی ممکن است شامل هزینه ارسال باشد که
          پیش از پرداخت به اطلاع شما می‌رسد. ثبت سفارش پس از تأیید موجودی و
          هماهنگی پرداخت نهایی می‌شود.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">۲. پرداخت</h2>
        <p className="mt-2">{business.paymentInfo}</p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">۳. ارسال و تحویل</h2>
        <p className="mt-2">{business.defaultShipping}</p>
        <p className="mt-2">
          زمان تحویل بسته به شهر مقصد متغیر است و پس از ارسال، کد رهگیری در
          صورت امکان اعلام می‌شود.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">
          ۴. انصراف، مرجوعی و تعویض
        </h2>
        <ul className="mt-2 list-inside list-disc space-y-2">
          <li>
            مطابق قوانین تجارت الکترونیک، مشتری تا ۷ روز پس از تحویل (در
            صورت عدم استفاده و سالم بودن بسته‌بندی و برچسب) می‌تواند درخواست
            مرجوعی ثبت کند.
          </li>
          <li>
            کالاهای سفارشی یا بهداشتی/شخصی‌سازی‌شده مشمول مرجوعی نیستند مگر
            نقص فنی یا مغایرت با سفارش.
          </li>
          <li>
            هزینه ارسال مرجوعی در صورت تأیید نقص یا اشتباه فروشگاه بر عهده{" "}
            {business.legalName} است؛ در غیر این صورت بر عهده خریدار است.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">۵. مسئولیت‌ها</h2>
        <p className="mt-2">
          {business.legalName} در قبال تأخیر ناشی از نیروی قهری (قطعی اینترنت،
          بلایای طبیعی، محدودیت‌های پستی) مسئولیت جزئی ندارد. تصاویر محصول
          نزدیک به واقعیت است؛ اختلاف جزئی رنگ به دلیل نمایشگر مجاز است.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-cream">۶. استفاده از سایت</h2>
        <p className="mt-2">
          کاربران موظف به ورود اطلاعات صحیح تماس هستند. هرگونه سوءاستفاده از
          سایت، ربات یا حمله به زیرساخت پیگرد قانونی دارد. محتوای سایت تحت
          قوانین مالکیت معنوی محافظت می‌شود.
        </p>
      </section>

      <p className="text-muted">
        سؤالات حقوقی:{" "}
        <Link href="/contact" className="text-gold hover:underline">
          تماس با ما
        </Link>
        {" · "}
        <Link href="/privacy" className="text-gold hover:underline">
          حریم خصوصی
        </Link>
      </p>
    </LegalPage>
  );
}
