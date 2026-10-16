import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
import type { Category } from "@/lib/types";

export function CategoryCircles({
  collection,
  categories,
}: {
  collection: string;
  categories: Category[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-3 pb-8 sm:px-4 sm:pb-10">
      <h2 className="mb-6 text-sm text-muted">دسته‌بندی‌های مرتبط</h2>
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/collection/${collection}/${category.slug}`}
            className="min-w-0 text-center"
          >
            <span className="relative mx-auto block size-20 overflow-hidden rounded-full bg-surface ring-1 ring-white/10 transition hover:ring-gold/40 sm:size-24">
              <Image
                src={assetPath(category.image)}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="96px"
              />
            </span>
            <span className="mt-2 block text-xs leading-5 sm:text-sm">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
