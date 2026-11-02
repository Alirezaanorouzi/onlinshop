import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
import { formatNumber } from "@/lib/format";
import type { Collection } from "@/lib/types";

export function CollectionOvals({
  items,
}: {
  items: Array<{
    collection: Collection;
    productCount: number;
    imageUrl: string;
  }>;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-3 pb-8 sm:px-4 sm:pb-10">
      <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-12">
        {items.map(({ collection, productCount, imageUrl }) => (
          <Link
            key={collection.slug}
            href={`/collection/${collection.slug}`}
            className="group min-w-0 text-center"
          >
            <span className="relative mx-auto block h-24 w-40 overflow-hidden rounded-[50%] bg-surface ring-1 ring-white/10 transition group-hover:ring-gold/45 sm:h-28 sm:w-48">
              <Image
                src={assetPath(imageUrl)}
                alt=""
                fill
                loading="lazy"
                className="object-cover"
                sizes="(min-width: 640px) 192px, 160px"
              />
            </span>
            <span className="mt-3 block text-sm font-medium text-cream group-hover:text-gold">
              {collection.nav}
            </span>
            <span className="mt-1 block text-xs text-muted">
              {formatNumber(productCount)} محصول
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
