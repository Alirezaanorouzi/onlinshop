"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { assetPath } from "@/lib/asset-path";

type ProductImageGalleryProps = {
  images: string[];
  alt: string;
  variant: "card" | "detail";
  priority?: boolean;
  /** When set (grid cards), only the main image links to the product page */
  productHref?: string;
};

export function ProductImageGallery({
  images,
  alt,
  variant,
  priority = false,
  productHref,
}: ProductImageGalleryProps) {
  const [active, setActive] = useState(0);
  const src = images[active] ?? images[0];
  const showThumbs = images.length > 1;

  const mainSizes =
    variant === "detail"
      ? "(min-width: 1024px) 50vw, 100vw"
      : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

  const thumbClass = (selected: boolean) =>
    variant === "detail"
      ? `relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface sm:size-20 ${
          selected
            ? "ring-2 ring-gold ring-offset-2 ring-offset-ink"
            : "ring-1 ring-white/15 opacity-80 hover:opacity-100"
        }`
      : `relative size-9 shrink-0 overflow-hidden rounded-md bg-surface sm:size-10 ${
          selected
            ? "ring-2 ring-gold"
            : "ring-1 ring-white/15 opacity-75 hover:opacity-100"
        }`;

  const mainFrameClass =
    variant === "detail"
      ? "relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface"
      : "relative block aspect-[3/4] overflow-hidden rounded-xl bg-surface transition duration-300 group-hover:scale-[1.01]";

  const mainImage = (
    <div className={mainFrameClass}>
      <Image
        key={src}
        src={assetPath(src)}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        className="object-cover"
        sizes={mainSizes}
      />
    </div>
  );

  return (
    <div className={variant === "detail" ? "space-y-3" : "space-y-2"}>
      {productHref ? (
        <Link href={productHref} className="block min-w-0">
          {mainImage}
        </Link>
      ) : (
        mainImage
      )}
      {showThumbs && (
        <div
          className={
            variant === "detail"
              ? "flex gap-2 overflow-x-auto pb-1"
              : "flex gap-1.5 px-0.5"
          }
          role="tablist"
          aria-label="تصاویر محصول"
        >
          {images.map((image, index) => {
            const selected = index === active;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`تصویر ${index + 1}`}
                className={thumbClass(selected)}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActive(index);
                }}
              >
                <Image
                  src={assetPath(image)}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
