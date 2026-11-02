# SEO — فروشگاه قائم مقام

راهنمای عملی بر اساس مستندات رسمی [Google Search Central](https://developers.google.com/search/docs). هدف: **محتوای مفید برای خریدار** + **فنی درست برای کراول** — نه ترفند فقط برای رتبه.

---

## منابع رسمی (اولویت مطالعه)

| موضوع | لینک |
|--------|------|
| فروشگاه اینترنتی (ساختار، URL، sitemap، schema) | [SEO for ecommerce sites](https://developers.google.com/search/docs/specialty/ecommerce?hl=en) |
| محتوای مفید و people-first | [Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) |
| تجربهٔ صفحه (CWV، موبایل، HTTPS) | [Page experience](https://developers.google.com/search/docs/appearance/page-experience?hl=en) |
| Schema محصول | [Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product) |
| شروع SEO در گوگل | [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |

---

## وضعیت پروژه نسبت به راهنمای گوگل

### فنی (ecommerce + کشف محتوا)

| توصیهٔ گوگل | وضعیت در سایت |
|-------------|----------------|
| Sitemap با URLهای محصول و دسته | [`app/sitemap.ts`](../app/sitemap.ts) — پویا از SQLite، بدون دسته/محصول خالی |
| `robots.txt` و مسدود کردن صفحات غیرعمومی | [`app/robots.ts`](../app/robots.ts) — `/cart`, `/login`, `/account`, `/admin` |
| صفحهٔ اصلی واقعی (نه فقط ریدایرکت) | [`app/page.tsx`](../app/page.tsx) + [`components/HomePage.tsx`](../components/HomePage.tsx) |
| Canonical و `metadataBase` با دامنهٔ production | [`lib/seo/site.ts`](../lib/seo/site.ts) + [`app/layout.tsx`](../app/layout.tsx) — **`SITE_URL` الزامی** |
| URL پایدار برای محصول (`/product/slug`) | بدون تغییر slug پس از انتشار |
| Structured data: فروشگاه | **`ClothingStore`** + `logo`/`image` در [`lib/seo/organization-jsonld.ts`](../lib/seo/organization-jsonld.ts) |
| OG/Twitter تصویر (صفحهٔ اصلی، کالکشن، محصول) | [`lib/seo/share-image.ts`](../lib/seo/share-image.ts) — پیش‌فرض: تصویر محصول از کاتالوگ؛ اختیاری: `STORE_OG_IMAGE_URL` / `STORE_LOGO_URL` |
| Structured data: محصول (قیمت، موجودی، SKU) | **`Product`** + `Offer` (IRR) در [`lib/seo/product-jsonld.ts`](../lib/seo/product-jsonld.ts) |
| `noindex` برای سبد/پرداخت/حساب | layoutهای مربوط + [`noIndexMetadata()`](../lib/seo/site.ts) |

**Sitemap برای اسنپ‌پی و Search Console:** `https://ghaemmaghamp.ir/sitemap.xml`

### محتوا (helpful content — کار شما)

گوگل تأکید می‌کند محتوا برای **انسان** باشد، با **توضیح کامل و واقعی**، نه متن کوتاه تکراری برای رتبه.

| سوال از راهنمای helpful content | اقدام پیشنهادی |
|----------------------------------|----------------|
| توضیح کامل محصول (جنس، سایز، رنگ، کاربرد) | فیلدهای **توضیحات کامل / متا سئو** در پنل ادمین |
| اعتماد (درباره ما، تماس، اینماد) | `/about`, `/contact`, `ENAMAD_*` |
| عنوان صفحهٔ اصلی واضح | H1: **پوشاک قائم مقام**؛ title: «خرید آنلاین لباس زنانه و مردانه» |
| بدون نظر/ستارهٔ ساختگی در schema | رعایت شده — فقط `Product`/`Offer` واقعی |
| E-E-A-T برای فروشگاه پوشاک | آدرس و تلفن واقعی در env + schema فروشگاه |

### تجربهٔ صفحه (page experience)

| جنبه | وضعیت / اقدام |
|------|----------------|
| HTTPS | لیارا + دامنهٔ `ghaemmaghamp.ir` |
| موبایل (RTL، viewport) | [`app/layout.tsx`](../app/layout.tsx) `lang="fa"` |
| Core Web Vitals (LCP, CLS, INP) | بعد از هر استقرار: [PageSpeed Insights](https://pagespeed.web.dev/) روی `/` و یک `/product/...`؛ گزارش **Core Web Vitals** در Search Console |
| تصاویر سبک‌تر | `next/image` + WebP/AVIF — [`next.config.ts`](../next.config.ts) |
| بدون interstitial مزاحم | فروشگاه interstitial تبلیغاتی ندارد |
| تبلیغات زیاد روی محتوا | — (فعلاً نداریم) |

گوگل می‌گوید **یک سیگنال واحد «page experience» نیست**؛ CWV در رتبه‌بندی نقش دارد، ولی **مرتبط‌ترین محتوا** هنوز مهم‌تر است.

---

## متغیرهای محیط (production)

```env
SITE_URL=https://ghaemmaghamp.ir
```

برای تصاویر S3 مطلق: `S3_PUBLIC_BASE_URL` (و در صورت نیاز همان دامنه در remote patterns).

برای **لوگو/تصویر ثابت** در گوگل و شبکه‌های اجتماعی (اختیاری — وگرنه از تصویر یک محصول در کاتالوگ استفاده می‌شود):

```env
STORE_OG_IMAGE_URL=https://ghaemmaghamp.ir/uploads/og.jpg
STORE_LOGO_URL=https://ghaemmaghamp.ir/uploads/logo-square.jpg
```

---

## Google Search Console (گام‌های عملی)

1. [Search Console](https://search.google.com/search-console) → property: `https://ghaemmaghamp.ir`
2. تأیید مالکیت (DNS یا HTML)
3. **Sitemaps** → `https://ghaemmaghamp.ir/sitemap.xml`
4. **URL inspection** → درخواست index برای `/` و یک محصول پس از تغییرات مهم
5. **Enhancements** → بررسی **Product** / **Merchant listings** (در صورت eligibility)
6. **Experience** → Core Web Vitals و HTTPS

---

## اختیاری — گام بعد (طبق ecommerce docs)

این‌ها در کد فعلاً **نیست**؛ فقط در صورت نیاز کسب‌وکار:

- **`BreadcrumbList`** schema روی محصول/دسته (کمک به درک ساختار)
- **`MerchantReturnPolicy`** nested under Organization (گوگل برای merchant listings پیشنهاد می‌دهد)
- **Google Merchant Center** + feed محصول (علاوه بر schema صفحه — برای Shopping / برخی rich results)
- **Product variants** در schema اگر هر رنگ/سایز SKU جدا بخواهید (الان یک `Offer` با موجودی کلی)

---

## چک‌لیست کوتاه بعد از deploy

- [ ] `SITE_URL` روی لیارا
- [ ] `/robots.txt` و `/sitemap.xml` در مرورگر
- [ ] View-source: `ClothingStore` + `Product` JSON-LD
- [ ] PageSpeed روی موبایل
- [ ] Search Console: sitemap بدون خطا

---

## فایل‌های فنی در ریپو

| مسیر | نقش |
|------|-----|
| [`lib/seo/`](../lib/seo/) | URL، sitemap، Product/Organization JSON-LD |
| [`app/sitemap.ts`](../app/sitemap.ts) | sitemap پویا |
| [`app/robots.ts`](../app/robots.ts) | robots |
| [`docs/DEPLOY-LIARA.md`](DEPLOY-LIARA.md) | استقرار و env |
