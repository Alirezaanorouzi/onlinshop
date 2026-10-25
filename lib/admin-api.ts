import type { Color, CollectionSlug, Product } from "@/lib/types";
import { apiPath } from "@/lib/api-path";

export const ADMIN_TOKEN_KEY = "onlineshop_admin_token";

export function notifyAdminSession() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin-session"));
  }
}

export function getStoredAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromLocal = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (fromLocal) return fromLocal;
  const legacy = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  if (legacy) {
    localStorage.setItem(ADMIN_TOKEN_KEY, legacy);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
  return legacy;
}

export function setStoredAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  notifyAdminSession();
}

export function clearStoredAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  notifyAdminSession();
}

export async function adminFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getStoredAdminToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(apiPath(path), { ...init, headers, credentials: "include" });
}

export type ProductInput = {
  slug: string;
  name: string;
  collection: CollectionSlug;
  category: string;
  price: number;
  description: string;
  primaryImageUrl: string;
  galleryUrls: string[];
  colors: Color[];
  sizes: string[];
};

export async function listAdminProducts() {
  const response = await adminFetch("/api/admin/products");
  if (!response.ok) throw new Error(await response.text());
  const data = (await response.json()) as { products: Product[] };
  return data.products;
}

export async function saveProduct(
  input: ProductInput,
  isNew: boolean,
): Promise<string> {
  const response = await adminFetch(
    isNew ? "/api/admin/products" : `/api/admin/products/${encodeURIComponent(input.slug)}`,
    {
      method: isNew ? "POST" : "PUT",
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) throw new Error(await response.text());
  const data = (await response.json()) as { slug?: string };
  return data.slug ?? input.slug;
}

export async function removeProduct(slug: string) {
  const response = await adminFetch(
    `/api/admin/products/${encodeURIComponent(slug)}`,
    { method: "DELETE" },
  );
  if (!response.ok) throw new Error(await response.text());
}

export type AdminOrder = {
  id: number;
  amountTomans: number;
  status: string;
  shipped: boolean;
  shipmentLabel: "ارسال شده" | "ارسال نشده";
  shippingFullName: string;
  shippingPhone: string;
  shippingCity: string;
  shippingAddress: string;
  shippingPostalCode: string;
  createdAt: string;
  refId: string | null;
  items: {
    productSlug: string;
    productName: string;
    size: string;
    color: string;
    colorLabel: string;
    quantity: number;
    unitPriceTomans: number;
  }[];
};

export async function listAdminOrders(): Promise<AdminOrder[]> {
  const response = await adminFetch("/api/admin/orders");
  if (!response.ok) throw new Error(await response.text());
  const data = (await response.json()) as { orders: AdminOrder[] };
  return data.orders;
}

export async function setAdminOrderShipped(orderId: number, shipped: boolean) {
  const response = await adminFetch(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ shipped }),
  });
  if (!response.ok) throw new Error(await response.text());
}

export type AdminCategoryImage = {
  categorySlug: string;
  name: string;
  imageUrl: string;
  hasOverride: boolean;
};

export async function listAdminCategoryImages(collection: CollectionSlug) {
  const response = await adminFetch(
    `/api/admin/category-images?collection=${encodeURIComponent(collection)}`,
  );
  if (!response.ok) throw new Error(await response.text());
  const data = (await response.json()) as { categories: AdminCategoryImage[] };
  return data.categories;
}

export async function saveAdminCategoryImage(input: {
  collection: CollectionSlug;
  categorySlug: string;
  imageUrl: string;
}) {
  const response = await adminFetch("/api/admin/category-images", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await response.text());
  const data = (await response.json()) as { categories: AdminCategoryImage[] };
  return data.categories;
}

export async function deleteAdminCategoryImage(
  collection: CollectionSlug,
  categorySlug: string,
) {
  const response = await adminFetch("/api/admin/category-images", {
    method: "DELETE",
    body: JSON.stringify({ collection, categorySlug }),
  });
  if (!response.ok) throw new Error(await response.text());
  const data = (await response.json()) as { categories: AdminCategoryImage[] };
  return data.categories;
}

export async function uploadAdminCategoryImage(
  collection: CollectionSlug,
  categorySlug: string,
  file: File,
) {
  const form = new FormData();
  form.set("file", file);
  form.set("collection", collection);
  form.set("categorySlug", categorySlug);
  const response = await adminFetch("/api/admin/category-images", {
    method: "POST",
    body: form,
  });
  if (!response.ok) throw new Error(await response.text());
  const data = (await response.json()) as { categories: AdminCategoryImage[] };
  return data.categories;
}

export async function uploadImage(file: File, prefix = "products") {
  const form = new FormData();
  form.set("file", file);
  form.set("prefix", prefix);
  const response = await adminFetch("/api/admin/upload", {
    method: "POST",
    body: form,
  });
  if (!response.ok) throw new Error(await response.text());
  const data = (await response.json()) as { publicUrl: string };
  return data.publicUrl;
}
