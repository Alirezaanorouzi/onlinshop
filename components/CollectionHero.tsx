import { formatNumber } from "@/lib/format";
import type { Collection } from "@/lib/types";

export function CollectionHero({
  collection,
  count,
  compact = false,
}: {
  collection: Collection;
  count: number;
  compact?: boolean;
}) {
  const content = (
    <>
      <div>
        <p className="text-[11px] tracking-[0.35em] text-gold">COLLECTION</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          {collection.title}
        </h1>
        <p className="mt-4 text-sm text-muted">
          {formatNumber(count)} محصول
        </p>
      </div>
      <p
        className={
          compact
            ? "mt-6 max-w-md text-sm leading-8 text-cream/80"
            : "max-w-md text-sm leading-8 text-cream/80 md:justify-self-start"
        }
      >
        {collection.description}
      </p>
    </>
  );

  if (compact) {
    return <div className="flex h-full flex-col justify-center">{content}</div>;
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:items-end md:py-20">
      {content}
    </section>
  );
}
