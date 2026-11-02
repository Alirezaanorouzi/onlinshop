import Link from "next/link";
import { CategoryCircles } from "@/components/CategoryCircles";
import { CollectionHero } from "@/components/CollectionHero";
import { ProductStrip } from "@/components/ProductStrip";
import { SnappPayPromo } from "@/components/SnappPayPromo";
import { getCollections } from "@/lib/catalog";
import {
  getCategoriesWithProducts,
  getNewestProducts,
  getProducts,
  getTopSellingProducts,
} from "@/lib/catalog-server";
import { business } from "@/lib/business";
import { formatNumber } from "@/lib/format";
import { homePageH1 } from "@/lib/seo/organization-jsonld";
import { site } from "@/lib/site";

export function HomePage() {
  const collections = getCollections();
  const men = collections.find((c) => c.slug === "men");
  const women = collections.find((c) => c.slug === "women");
  const menCount = men ? getProducts({ collection: "men" }).length : 0;
  const womenCount = women ? getProducts({ collection: "women" }).length : 0;
  const menCategories = men ? getCategoriesWithProducts("men") : [];
  const womenCategories = women ? getCategoriesWithProducts("women") : [];
  const newest = getNewestProducts(8);
  const bestSellers = getTopSellingProducts(8);
  const featuredMen =
    getProducts({ collection: "men", category: "hoodie" })[0] ??
    getProducts({ collection: "men" })[0] ??
    null;

  return (
    <>
      <section className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-14">
        <p className="text-[11px] tracking-[0.35em] text-gold">فروشگاه اینترنتی</p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-4xl">{homePageH1}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-cream/85">
          {business.tagline} خرید آنلاین پوشاک آقایان و بانوان با قیمت شفاف،
          ارسال به سراسر کشور و پشتیبانی از طریق تماس و ایمیل.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/about" className="text-gold hover:underline">
            بیشتر درباره فروشگاه
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-3 pb-10 sm:px-4">
        <h2 className="mb-6 text-sm text-muted">کالکشن‌ها</h2>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {men && (
            <div className="rounded-2xl border border-white/10 bg-surface/20 p-4 sm:p-6">
              <CollectionHero collection={men} count={menCount} compact />
              <Link
                href="/collection/men"
                className="mt-6 inline-block text-sm text-gold hover:underline"
              >
                مشاهده کالکشن آقایان ({formatNumber(menCount)} محصول)
              </Link>
            </div>
          )}
          {women && (
            <div className="rounded-2xl border border-white/10 bg-surface/20 p-4 sm:p-6">
              <CollectionHero collection={women} count={womenCount} compact />
              <Link
                href="/collection/women"
                className="mt-6 inline-block text-sm text-gold hover:underline"
              >
                مشاهده کالکشن بانوان ({formatNumber(womenCount)} محصول)
              </Link>
            </div>
          )}
        </div>
      </section>

      {menCategories.length > 0 && (
        <CategoryCircles collection="men" categories={menCategories} />
      )}
      {womenCategories.length > 0 && (
        <CategoryCircles collection="women" categories={womenCategories} />
      )}

      {newest.length > 0 && (
        <ProductStrip title="جدیدترین محصولات" products={newest} />
      )}

      {bestSellers.length > 0 && (
        <ProductStrip title="پرفروش‌ترین‌ها" products={bestSellers} />
      )}

      <section className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-14">
        <h2 className="text-sm text-muted">مزایای خرید از {site.name}</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-8 text-cream/85">
          <li>پرداخت امن با درگاه زرین‌پال</li>
          <li>امکان پرداخت قسطی با اسنپ‌پی (در صورت فعال بودن برای سفارش شما)</li>
          <li>{business.defaultShipping}</li>
          <li>پشتیبانی: {business.phoneMobile} — {business.hours}</li>
        </ul>
        {featuredMen ? (
          <div className="mt-8 max-w-md">
            <SnappPayPromo compact featured={featuredMen} />
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-6xl px-3 pb-14 sm:px-4 sm:pb-20">
        <h2 className="text-sm text-muted">تماس</h2>
        <p className="mt-3 text-sm leading-8 text-cream/85">
          {business.address}
          <br />
          تلفن:{" "}
          <a href={`tel:${business.phoneMobile}`} className="text-gold">
            {business.phoneMobile}
          </a>
          <br />
          {business.hours}
        </p>
        <Link href="/contact" className="mt-4 inline-block text-sm text-gold hover:underline">
          صفحه تماس با ما
        </Link>
      </section>
    </>
  );
}
