import { normalizeProductGallery } from "@/lib/product-gallery";
import type {
  Category,
  Collection,
  Product,
  Variant,
} from "@/lib/types";

export const collections: Collection[] = [
  {
    slug: "men",
    title: "کالکشن آقایان",
    nav: "کالکشن آقایان",
    description:
      "جدیدترین کالکشن آقایان قائم مقام؛ پیراهن، تیشرت، دورس و هودی، کت و کاپشن، شلوار، شلوارک و کفش.",
    categories: [
      { slug: "accessory", name: "اکسسوری مردانه" },
      { slug: "shirt", name: "پیراهن مردانه" },
      { slug: "tshirt", name: "تیشرت مردانه" },
      { slug: "hoodie", name: "دورس و هودی مردانه" },
      { slug: "coat-jacket", name: "کت و کاپشن مردانه" },
      { slug: "set", name: "ست مردانه" },
      { slug: "pants", name: "شلوار مردانه" },
      { slug: "shorts", name: "شلوارک مردانه" },
      { slug: "shoes", name: "کفش مردانه" },
    ],
  },
  {
    slug: "women",
    title: "کالکشن بانوان",
    nav: "کالکشن بانوان",
    description:
      "کالکشن بانوان قائم مقام؛ شومیز، هودی و سویشرت، بافت و دورس، مانتو و پالتو، کاپشن و بارانی، کیف و کفش، تیشرت، ست، شلوار و اکسسوری.",
    categories: [
      { slug: "shomiz", name: "شومیز زنانه" },
      { slug: "hoodie-sweatshirt", name: "هودی و سویشرت زنانه" },
      { slug: "knit-tunic", name: "بافت و دورس زنانه" },
      { slug: "manto-coat", name: "مانتو و پالتو زنانه" },
      { slug: "rain-jacket", name: "کاپشن و بارانی زنانه" },
      { slug: "bag-shoes", name: "کیف و کفش زنانه" },
      { slug: "tshirt", name: "تیشرت زنانه" },
      { slug: "set", name: "ست زنانه" },
      { slug: "pants", name: "شلوار زنانه" },
      { slug: "accessory", name: "اکسسوری زنانه" },
    ],
  },
];

export const menCategoryImages: Record<string, string> = {
  accessory: "/images/categories/men-accessory.png",
  shirt: "/images/categories/men-shirt.png",
  tshirt: "/images/categories/men-tshirt.png",
  hoodie: "/images/categories/men-hoodie.png",
  set: "/images/categories/men-set.png",
  pants: "/images/categories/men-pants.png",
  shorts: "/images/categories/men-shorts.png",
  shoes: "/images/categories/men-shoes.png",
};

export function variantsFor(
  sizes: string[],
  colors: { id: string }[],
): Variant[] {
  return sizes.flatMap((size, sizeIndex) =>
    colors.map((color, colorIndex) => ({
      size,
      color: color.id,
      inStock: !(
        sizeIndex === 0 &&
        colorIndex === colors.length - 1 &&
        colors.length > 1
      ),
    })),
  );
}

export function rowToProduct(row: {
  slug: string;
  name: string;
  collection: Product["collection"];
  category: string;
  price: number;
  description: string;
  primaryImageUrl: string;
  galleryUrls: string[];
  colors: Product["colors"];
  sizes: string[];
}): Product {
  const { primaryImageUrl, galleryUrls } = normalizeProductGallery(
    row.primaryImageUrl,
    row.galleryUrls,
  );
  return {
    slug: row.slug,
    name: row.name,
    collection: row.collection,
    category: row.category,
    price: row.price,
    image: primaryImageUrl,
    images: galleryUrls.length > 1 ? galleryUrls : undefined,
    description: row.description,
    colors: row.colors,
    sizes: row.sizes,
    variants: variantsFor(row.sizes, row.colors),
  };
}

export function getCollections() {
  return collections;
}

export function getCollection(slug: string) {
  return collections.find((collection) => collection.slug === slug);
}

export function isVariantInStock(
  product: Product,
  size: string,
  color: string,
) {
  return (
    product.variants.find(
      (variant) => variant.size === size && variant.color === color,
    )?.inStock ?? false
  );
}

export function buildCategories(
  collectionSlug: string,
  productImageByCategory: Map<string, string>,
  categoryImageOverrides: Map<string, string>,
): Category[] {
  const collection = getCollection(collectionSlug);
  if (!collection) return [];

  return collection.categories.map((category) => ({
    ...category,
    image:
      categoryImageOverrides.get(`${collectionSlug}:${category.slug}`) ||
      (collectionSlug === "men" && menCategoryImages[category.slug]) ||
      productImageByCategory.get(category.slug) ||
      "",
  }));
}
