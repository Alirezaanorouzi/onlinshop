import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { Color, CollectionSlug } from "@/lib/types";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  collection: text("collection").notNull().$type<CollectionSlug>(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  primaryImageUrl: text("primary_image_url").notNull(),
  galleryUrls: text("gallery_urls", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  colors: text("colors", { mode: "json" }).$type<Color[]>().notNull(),
  sizes: text("sizes", { mode: "json" }).$type<string[]>().notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsecond') * 1000)`),
});

export const categoryImages = sqliteTable(
  "category_images",
  {
    collection: text("collection").notNull().$type<CollectionSlug>(),
    categorySlug: text("category_slug").notNull(),
    imageUrl: text("image_url").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.collection, table.categorySlug] }),
  }),
);

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone").unique(),
  fullName: text("full_name"),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  role: text("role").notNull().default("admin"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsecond') * 1000)`),
});

export const otpVerifications = sqliteTable("otp_verifications", {
  phone: text("phone").primaryKey(),
  codeHash: text("code_hash").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  lastSentAt: integer("last_sent_at", { mode: "timestamp_ms" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

/** Account → profile section (1:1 with customer users). */
export const customerProfiles = sqliteTable("customer_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull().default(""),
  city: text("city").notNull().default(""),
  address: text("address").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsecond') * 1000)`),
});

/** Account → orders section (checkout / fulfillment). */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("awaiting_payment"),
  amountTomans: integer("amount_tomans").notNull(),
  shippingFullName: text("shipping_full_name").notNull(),
  shippingPhone: text("shipping_phone").notNull(),
  shippingCity: text("shipping_city").notNull().default(""),
  shippingAddress: text("shipping_address").notNull(),
  shippingPostalCode: text("shipping_postal_code").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsecond') * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsecond') * 1000)`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  size: text("size").notNull(),
  color: text("color").notNull(),
  unitPriceTomans: integer("unit_price_tomans").notNull(),
  quantity: integer("quantity").notNull(),
});

export const payments = sqliteTable("payments", {
  authority: text("authority").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
  amountTomans: integer("amount_tomans").notNull(),
  cartJson: text("cart_json").notNull(),
  status: text("status").notNull().default("pending"),
  refId: text("ref_id"),
  mobile: text("mobile"),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  shippingJson: text("shipping_json"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsecond') * 1000)`),
});

export const assets = sqliteTable("assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  objectKey: text("object_key").notNull().unique(),
  bucket: text("bucket").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  publicUrl: text("public_url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsecond') * 1000)`),
});
