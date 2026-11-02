import Link from "next/link";
import { ProductStrip } from "@/components/ProductStrip";
import { SnappPayPromo } from "@/components/SnappPayPromo";
import { getNewestProducts, getProducts, getTopSellingProducts } from "@/lib/catalog-server";
import { business } from "@/lib/business";
import { homePageH1 } from "@/lib/seo/organization-jsonld";
import { site } from "@/lib/site";

export function HomePage() {
  const newest = getNewestProducts(8);
  const bestSellers = getTopSellingProducts(8);
  const featuredForSnapp =
    getProducts({ collection: "men", category: "hoodie" })[0] ??
    getProducts({ collection: "men" })[0] ??
    getProducts()[0] ??
    null;

  return (
    <>
      {featuredForSnapp ? (
        <section className="mx-auto max-w-6xl px-3 pt-4 pb-2 sm:px-4 sm:pt-5">
          <SnappPayPromo compact featured={featuredForSnapp} />
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-3 pb-4 sm:px-4 sm:pb-6">
        <p className="text-[11px] tracking-[0.35em] text-gold">فروشگاه اینترنتی</p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-4xl">{homePageH1}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-cream/85">
          {business.tagline} خرید آنلاین پوشاک آقایان و بانوان با قیمت شفاف و
          ارسال به سراسر کشور.
        </p>
      </section>

      {newest.length > 0 && (
        <ProductStrip title="جدیدترین محصولات" products={newest} />
      )}

      {bestSellers.length > 0 && (
        <ProductStrip title="پرفروش‌ترین‌ها" products={bestSellers} />
      )}

      <section className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-12">
        <h2 className="text-sm text-muted">مزایای خرید از {site.name}</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-8 text-cream/85">
          <li>پرداخت امن با درگاه زرین‌پال</li>
          <li>امکان پرداخت قسطی با اسنپ‌پی (در صورت فعال بودن برای سفارش شما)</li>
          <li>{business.defaultShipping}</li>
        </ul>
        <p className="mt-8 text-sm text-muted">
          {business.address} ·{" "}
          <a href={`tel:${business.phoneMobile}`} className="text-gold">
            {business.phoneMobile}
          </a>
          {" · "}
          <Link href="/contact" className="text-gold hover:underline">
            تماس با ما
          </Link>
        </p>
      </section>
    </>
  );
}
