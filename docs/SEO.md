# SEO — فروشگاه قائم مقام

## متغیرهای محیط (الزامی در production)

- **`SITE_URL=https://ghaemmaghamp.ir`** — برای `metadataBase`، canonical، Open Graph و sitemap. بدون این مقدار در لیارا، متادیتا ممکن است به `localhost` اشاره کند.

## فایل‌های فنی

| مسیر | نقش |
|------|-----|
| [`app/page.tsx`](../app/page.tsx) | صفحهٔ اصلی فروشگاه (بدون ریدایرکت) |
| [`app/sitemap.ts`](../app/sitemap.ts) | sitemap پویا از SQLite (محصولات موجود، دسته‌های غیرخالی) |
| [`app/robots.ts`](../app/robots.ts) | robots + ارجاع به sitemap |
| [`lib/seo/`](../lib/seo/) | URL، متا، JSON-LD، sitemap |

**URL sitemap برای اسنپ‌پی و گوگل:** `https://ghaemmaghamp.ir/sitemap.xml`

## Google Search Console

1. [Search Console](https://search.google.com/search-console) → افزودن property با `https://ghaemmaghamp.ir`
2. تأیید مالکیت (DNS یا HTML)
3. **Sitemaps** → ثبت `https://ghaemmaghamp.ir/sitemap.xml`
4. **URL inspection** برای `/` و یک `/product/...` بعد از هر استقرار مهم

## محتوا در پنل ادمین

برای هر محصول در **ویرایش محصول**:

- **توضیحات** — خلاصهٔ کوتاه (نمایش در کارت و زیر عنوان)
- **عنوان سئو / توضیح متا / توضیحات کامل** — اختیاری؛ اگر خالی باشد از نام و توضیح کوتاه استفاده می‌شود

توضیحات کامل را با اطلاعات **واقعی** بنویسید (جنس، دوخت، رنگ، سایز). برای سئو دروغ یا ویژگی ساختگی نگذارید.

## تصاویر (P2)

- بهینه‌سازی **`next/image`** فعال است (WebP/AVIF از طریق `/_next/image`).
- آپلودهای محلی از `/api/files/…` و استاتیک از `/images/…` پشتیبانی می‌شوند.
- برای URL مطلق S3، **`S3_PUBLIC_BASE_URL`** (و **`SITE_URL`**) در env باید تنظیم باشد تا در `remotePatterns` قرار گیرد.
- بعد از استقرار، [PageSpeed Insights](https://pagespeed.web.dev/) را روی صفحهٔ محصول و صفحهٔ اصلی بزنید.

## Schema (صفحهٔ اصلی)

- **`ClothingStore`** JSON-LD از [`lib/seo/organization-jsonld.ts`](../lib/seo/organization-jsonld.ts) — نام «پوشاک قائم مقام»، آدرس، تلفن، ساعات کاری، URL (از `SITE_URL`).
