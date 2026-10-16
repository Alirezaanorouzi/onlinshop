export type CollectionSlug = "men" | "women";

export type Color = {
  id: string;
  name: string;
  hex: string;
};

export type Variant = {
  size: string;
  color: string;
  inStock: boolean;
};

export type Product = {
  slug: string;
  name: string;
  collection: CollectionSlug;
  category: string;
  price: number;
  image: string;
  /** Extra gallery shots; falls back to `image` when omitted */
  images?: string[];
  description: string;
  colors: Color[];
  sizes: string[];
  variants: Variant[];
};

export type Category = {
  slug: string;
  name: string;
  image: string;
};

export type Collection = {
  slug: CollectionSlug;
  title: string;
  nav: string;
  description: string;
  categories: { slug: string; name: string }[];
};

export type CartLine = {
  productSlug: string;
  size: string;
  color: string;
  quantity: number;
};
