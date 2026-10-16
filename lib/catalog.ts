import rawCatalog from "@/data/catalog.json";
import type {
  Category,
  Collection,
  CollectionSlug,
  Product,
  Variant,
} from "@/lib/types";

type RawProduct = Omit<Product, "variants" | "collection"> & {
  collection: CollectionSlug | "kids";
};

const collections: Collection[] = [
  {
    slug: "men",
    title: "کالکشن آقایان",
    nav: "کالکشن آقایان",
    description:
      "جدیدترین کالکشن آقایان قائم مقام؛ پیراهن، تیشرت، هودی، شلوار و کفش با برش راحت برای استفاده روزمره.",
    categories: [
      { slug: "accessory", name: "اکسسوری مردانه" },
      { slug: "shirt", name: "پیراهن مردانه" },
      { slug: "tshirt", name: "تیشرت مردانه" },
      { slug: "hoodie", name: "دورس و هودی مردانه" },
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
      "کالکشن بانوان قائم مقام با بلوز، تیشرت، هودی، شلوار، دامن و کفش برای پوشش روزمره.",
    categories: [
      { slug: "accessory", name: "اکسسوری زنانه" },
      { slug: "blouse", name: "بلوز زنانه" },
      { slug: "tshirt", name: "تیشرت زنانه" },
      { slug: "hoodie", name: "هودی زنانه" },
      { slug: "set", name: "ست زنانه" },
      { slug: "pants", name: "شلوار زنانه" },
      { slug: "skirt", name: "دامن زنانه" },
      { slug: "shoes", name: "کفش زنانه" },
    ],
  },
];

const menCategoryImages: Record<string, string> = {
  accessory: "/images/categories/men-accessory.png",
  shirt: "/images/categories/men-shirt.png",
  tshirt: "/images/categories/men-tshirt.png",
  hoodie: "/images/categories/men-hoodie.png",
  set: "/images/categories/men-set.png",
  pants: "/images/categories/men-pants.png",
  shorts: "/images/categories/men-shorts.png",
  shoes: "/images/categories/men-shoes.png",
};

function variantsFor(product: RawProduct): Variant[] {
  return product.sizes.flatMap((size, sizeIndex) =>
    product.colors.map((color, colorIndex) => ({
      size,
      color: color.id,
      inStock: !(
        sizeIndex === 0 &&
        colorIndex === product.colors.length - 1 &&
        product.colors.length > 1
      ),
    })),
  );
}

const products: Product[] = (rawCatalog as RawProduct[])
  .filter(
    (product): product is RawProduct & { collection: CollectionSlug } =>
      product.collection === "men" || product.collection === "women",
  )
  .map((product) => ({
    ...product,
    variants: variantsFor(product),
  }));

export function getCollections() {
  return collections;
}

export function getCollection(slug: string) {
  return collections.find((collection) => collection.slug === slug);
}

export function getCategories(collectionSlug: string): Category[] {
  const collection = getCollection(collectionSlug);
  if (!collection) return [];

  return collection.categories.map((category) => ({
    ...category,
    image:
      (collectionSlug === "men" && menCategoryImages[category.slug]) ||
      products.find(
        (product) =>
          product.collection === collectionSlug &&
          product.category === category.slug,
      )?.image ||
      "",
  }));
}

export function getCategory(collectionSlug: string, categorySlug: string) {
  return getCategories(collectionSlug).find(
    (category) => category.slug === categorySlug,
  );
}

export function getProducts(filter?: {
  collection?: string;
  category?: string;
  query?: string;
}) {
  const query = filter?.query?.trim();
  return products.filter((product) => {
    if (filter?.collection && product.collection !== filter.collection) {
      return false;
    }
    if (filter?.category && product.category !== filter.category) {
      return false;
    }
    if (query && !product.name.includes(query)) return false;
    return true;
  });
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
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
