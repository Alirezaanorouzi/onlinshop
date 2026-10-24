/**
 * Client-safe catalog helpers (collections + variant stock).
 * Product lists: use `@/lib/catalog-server` on the server or `/api/products` on the client.
 */
export {
  getCollections,
  getCollection,
  isVariantInStock,
  menCategoryImages,
} from "@/lib/catalog-meta";
