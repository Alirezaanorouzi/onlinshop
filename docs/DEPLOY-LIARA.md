# استقرار قائم مقام روی لیارا (پلتفرم Next.js)

## خلاصه

| مورد | انتخاب |
|------|--------|
| پلتفرم | **Next.js** (نه Laravel، نه Static) |
| Node | **22** (در `liara.json`) |
| دیتابیس | **SQLite** روی دیسک `shop-data` → پوشه `data/` |
| تصاویر | دیسک `shop-uploads` → `public/uploads/` **یا** [ذخیره‌سازی ابری S3](https://docs.liara.ir/object-storage/about/) |
| استقرار | Liara CLI یا ZIP در کنسول |

---

## مرحله ۱ — حساب و برنامه

1. وارد [console.liara.ir](https://console.liara.ir) شوید.
2. منو **پلتفرم** → **ایجاد برنامه**.
3. نوع برنامه: **Next.js**.
4. یک **شناسه** یکتا بگذارید (مثلاً `ghaim-magham` یا `onlineshop`).
5. شبکه و پلن را انتخاب کنید و برنامه را بسازید.

آدرس پیش‌فرض: `https://شناسه-شما.liara.run`

---

## مرحله ۲ — دیسک‌ها (حتماً قبل از اولین استقرار موفق)

در برنامه → **دیسک‌ها** → **ایجاد دیسک**:

| نام دیسک (در کنسول) | اندازه پیشنهادی | اتصال در `liara.json` |
|----------------------|-----------------|------------------------|
| `shop-data` | ۱ گیگ | `data` |
| `shop-uploads` | ۲–۵ گیگ | `public/uploads` |

نام دیسک‌ها باید **دقیقاً** مثل `liara.json` باشد.

---

## مرحله ۳ — متغیرهای محیطی

برنامه → **تنظیمات** → **متغیرهای محیطی**:

```env
CATALOG_BACKEND=sqlite
SQLITE_PATH=data/catalog.sqlite

# حتماً قبل از build **و runtime** روی Liara ست باشد — وگرنه فروشگاه همان catalog.json زمان build را نشان می‌دهد، نه SQLite ادمین.
# صفحات `/collection/*` و `/product/*` با `force-dynamic` از DB خوانده می‌شوند (خطای DYNAMIC_SERVER_USAGE بدون آن روی محصول رخ می‌دهد).

# ورود مدیر و مشتری: همان /login با OTP (کاوه‌نگار)
ADMIN_PHONE=09xxxxxxxxx
# بدون فاصله بعد از = — مثال اشتباه: ADMIN_PHONE= 0912...
# برای عوض کردن مدیر: فقط این مقدار را در لیارا عوض کنید و اپ را ری‌استارت کنید؛ مایگریت همان شماره را admin می‌کند و بقیهٔ admin‌های قبلی customer می‌شوند. سپس با شمارهٔ جدید در /login OTP بگیرید.

# اختیاری — برای sync مایگریت / legacy؛ روی صفحهٔ login نمایش داده نمی‌شود
# ADMIN_EMAIL=...
# ADMIN_PASSWORD=...

# اختیاری — فقط API آپلود با Bearer؛ ورود روزمره با OTP است
# ADMIN_TOKEN=...

# درگاه زرین‌پال (بدون این‌ها دکمهٔ پرداخت آنلاین در سبد خرید نمایش داده نمی‌شود)
ZARINPAL_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SITE_URL=https://دامنه-شما.ir
# اختیاری: ZARINPAL_SANDBOX=true برای تست | ZARINPAL_ACCESS_TOKEN=...

# اسنپ‌پی (پرداخت اقساطی) — IP خروجی سرور را در portal.snapppay.ir whitelist کنید
# SNAPPPAY_BASE_URL=https://api.snapppay.ir
# SNAPPPAY_CLIENT_ID= ...
# SNAPPPAY_CLIENT_SECRET= ...
# SNAPPPAY_USERNAME= ...
# SNAPPPAY_PASSWORD= ...

# اسنپ‌پی — Site Map URL: https://دامنه-شما.ir/sitemap.xml (فایل sitemap.xml در ریشهٔ پروژه)

# اینماد — کد HTML را **عیناً** از پنل کپی کنید (داخل گیومهٔ دوتایی):
# ENAMAD_EMBED="<a referrerpolicy='origin' target='_blank' href='...'><img ...></a>"
# rel= روی لینک نگذارید (noreferrer لوگو را خراب می‌کند).

# روی دامنه liara.run base path لازم نیست — NEXT_PUBLIC_BASE_PATH را ست نکنید.

# اعلان سفارش پرداخت‌شده در تلگرام (ربات را ادمین کانال خصوصی کنید)
# TELEGRAM_BOT_TOKEN=
# TELEGRAM_CHAT_ID=-100...
# TELEGRAM_NOTIFY_ENABLED=true
```

### تصاویر — یکی از دو روش

**الف) ساده (مثل لوکال بدون Docker)** — فقط دیسک `shop-uploads`؛ `S3_*` را ست **نکنید**. فایل‌ها در `/uploads/...` ذخیره می‌شوند و روی لیارا از طریق rewrite به `/api/files/...` سرو می‌شوند (دیسک mount).

**ب) ذخیره‌سازی ابری لیارا (S3)** — از منو **ذخیره‌سازی ابری** باکت بسازید و کلید API بگیرید:

```env
S3_ENDPOINT=...
S3_REGION=...
S3_BUCKET=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_PUBLIC_BASE_URL=...
S3_FORCE_PATH_STYLE=true
```

---

## مرحله ۴ — استقرار کد

### روش A: Liara CLI (پیشنهادی)

توکن را فقط از **[console.liara.ir/API](https://console.liara.ir/API)** بگیرید (نه JWT از تب Network مرورگر).

```powershell
npm install -g @liara/cli
$env:LIARA_API_TOKEN = "توکن-از-صفحه-API"
$env:ADMIN_TOKEN = "رمز-مدیر-پروداکشن"
cd onlineshop
.\scripts\deploy-liara.ps1 -AppName "شناسه-برنامه-شما"
```

یا دستی:

```bash
liara login --api-token YOUR_TOKEN
liara deploy --app شناسه-برنامه-شما --port 3000
```

فایل `liara.json` در ریشه پروژه به‌صورت خودکار دیسک‌ها را وصل می‌کند.

### روش B: ZIP در کنسول

1. `node_modules` و `.next` را در ZIP نگذارید.
2. **استقرار جدید** → Drag & Drop ZIP.
3. در مرحله دیسک، `shop-data` → `data` و `shop-uploads` → `public/uploads`.

لیارا خودش `npm install` و `npm run build` و `npm start` را اجرا می‌کند.

---

## مرحله ۵ — یک‌بار بعد از اولین استقرار

در **شل** برنامه (کنسول لیارا) یا SSH:

```bash
npm run db:seed
npm run db:seed-admin
```

(`db:seed-admin` نیاز به `ADMIN_PHONE` در env دارد؛ مایگریت با هر `npm start` خودکار است. برای ست env از لوکال: `node scripts/liara-sync-admin-env.mjs`.)

**اعلان تلگرام بعد از پرداخت موفق:** در `.env.local` مقدار `TELEGRAM_BOT_TOKEN` و `TELEGRAM_CHAT_ID` (یا `CHANNEL_ID`) را بگذارید، ربات را **ادمین کانال خصوصی** کنید، سپس:

```bash
node scripts/liara-sync-telegram-env.mjs
```

**اسنپ‌پی (پرداخت اقساطی):** پنج متغیر `SNAPPPAY_*` را در `.env.local` بگذارید، IP خروجی Liara را در portal.snapppay.ir whitelist کنید، سپس از لوکال:

```bash
node scripts/liara-sync-snapppay-env.mjs
```

(اگر هم‌زمان زرین‌پال و اینماد را هم می‌خواهید: `node scripts/liara-sync-payment-env.mjs` — در صورت کامل بودن اسنپ‌پی، آن متغیرها را هم push می‌کند.)

---

## مرحله ۶ — تست

| آدرس | کار |
|------|-----|
| `/` | فروشگاه |
| `/login` | ورود با OTP؛ ادمین = همان شمارهٔ `ADMIN_PHONE` |
| `/api/health` | باید `{"ok":true,"catalog":"sqlite"}` بدهد |

---

## صفحهٔ سفید / فقط متن و لینک آبی (بدون استایل و تصویر)

یعنی **HTML از سرور می‌آید** اما **CSS یا JS** لود نمی‌شود (مثل لیست «محصولات» و «دسته‌بندی‌های مرتبط» بدون تم تیرهٔ فروشگاه).

### ۱) متغیرهای محیطی اشتباه (شایع‌ترین)

در کنسول لیارا → متغیرهای محیطی این‌ها را **حذف کنید** یا خالی بگذارید:

| متغیر | چرا |
|--------|-----|
| `NEXT_PUBLIC_BASE_PATH=/onlinshop` (یا هر مسیر اضافه) | فایل‌های `/_next/static/...` ۴۰۴ می‌شوند — اپ روی ریشهٔ دامنه است |

بعد از تغییر env، **استقرار مجدد** (rebuild) بزنید.

### ۲) کش مرورگر یا CDN بعد از deploy

هر بار build، نام فایل CSS عوض می‌شود. اگر HTML قدیمی کش شده باشد، لینک CSS قبلی **۴۰۴** می‌شود و صفحه خام می‌ماند.

- یک بار **Ctrl+Shift+R** (hard refresh) یا تب ناشناس
- یا دوباره deploy با آخرین commit

### ۳) تست سریع در مرورگر

1. F12 → **Network** → فیلتر **CSS**
2. صفحه را رفرش کنید؛ باید `/_next/static/chunks/....css` با وضعیت **200** باشد
3. اگر **404** است → env بالا را چک کنید یا deploy تازه بزنید

---

## سایت فقط «در حال بارگذاری» یا شبیه JSON / داده

Next با **Suspense + streaming** اول فقط «در حال بارگذاری…» می‌فرستد؛ اگر JS یا `_next/static` لود نشود، فروشگاه کامل دیده نمی‌شود. در نسخهٔ فعلی ریپو صفحات فروشگاه **بدون Suspense** رندر می‌شوند — دوباره `liara deploy` بزنید.

- آدرس فروشگاه: `https://دامنه-شما/collection/men` (نه `/api/products`)
- بعد از اولین deploy موفق: در شل → `npm run db:seed`

## اگر deploy روی Liara fail شد

- **اولین خطا:** `instant` در layout ادمین — در نسخهٔ فعلی ریپو حذف شده.
- **خطای `better_sqlite3.node`:** npm روی Liara اسکریپت نصب native را بدون `allowScripts` در `package.json` اجرا نمی‌کند؛ در build از JSON استفاده می‌شود (`NEXT_PHASE`)، در runtime از SQLite روی دیسک.
- لاگ: `liara app logs -a شناسه-برنامه` یا کنسول → استقرارها.

## نکات

- برای دامنه خودتان در لیارا، دامنه را در تنظیمات برنامه اضافه کنید.
- به‌روزرسانی: دوباره `liara deploy` یا ZIP جدید؛ دیتابیس و آپلودها روی دیسک می‌مانند.

مستندات رسمی: [استقرار Next.js](https://docs.liara.ir/paas/nextjs/how-tos/deploy-app/) · [SQLite + دیسک](https://docs.liara.ir/paas/nextjs/how-tos/connect-to-db/sqlite/)
