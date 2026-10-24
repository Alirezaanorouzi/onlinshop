import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { getConfiguredAdminPhone } from "@/lib/admin-phone";
import { getSqlitePath } from "@/lib/env";
import { hashPassword } from "@/lib/password";
import { randomBytes } from "node:crypto";

function placeholderPasswordHash() {
  return hashPassword(randomBytes(32).toString("hex"));
}

/** Keep admin user in sync from ADMIN_PHONE (OTP login) and optional legacy email/password. */
function syncAdminFromEnv(sqlite: Database.Database) {
  const adminPhone = getConfiguredAdminPhone();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (adminPhone) {
    const adminEmail = email || `admin-${adminPhone.slice(1)}@phone.local`;
    const passwordHash = password
      ? hashPassword(password)
      : placeholderPasswordHash();
    const byPhone = sqlite
      .prepare("SELECT id FROM users WHERE phone = ?")
      .get(adminPhone) as { id: number } | undefined;

    if (byPhone) {
      const emailTaken = sqlite
        .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
        .get(adminEmail, byPhone.id) as { id: number } | undefined;
      if (emailTaken) {
        // Legacy admin row (email login) — free ADMIN_EMAIL for the phone account.
        const orphanEmail = `legacy-${emailTaken.id}@phone.local`;
        sqlite
          .prepare(
            "UPDATE users SET email = ?, role = 'customer' WHERE id = ?",
          )
          .run(orphanEmail, emailTaken.id);
      }
      sqlite
        .prepare(
          `UPDATE users SET role = 'admin', email = ?, password_hash = ? WHERE id = ?`,
        )
        .run(adminEmail, passwordHash, byPhone.id);
    } else {
      const byEmail = email
        ? (sqlite
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(email) as { id: number } | undefined)
        : undefined;
      if (byEmail) {
        sqlite
          .prepare(
            `UPDATE users SET role = 'admin', phone = ?, password_hash = ? WHERE id = ?`,
          )
          .run(adminPhone, passwordHash, byEmail.id);
      } else {
        sqlite
          .prepare(
            `INSERT INTO users (email, password_hash, phone, role) VALUES (?, ?, ?, 'admin')`,
          )
          .run(adminEmail, passwordHash, adminPhone);
      }
    }

    // Only ADMIN_PHONE may be admin when env is set (e.g. after changing owner on Liara).
    sqlite
      .prepare(
        `UPDATE users SET role = 'customer' WHERE role = 'admin' AND (phone IS NULL OR phone != ?)`,
      )
      .run(adminPhone);
    return;
  }

  if (!email || !password) return;

  const passwordHash = hashPassword(password);
  const existing = sqlite
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email) as { id: number } | undefined;

  if (existing) {
    sqlite
      .prepare(
        "UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?",
      )
      .run(passwordHash, existing.id);
  } else {
    sqlite
      .prepare(
        "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')",
      )
      .run(email, passwordHash);
  }
}

const migrations = [
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    collection TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT NOT NULL,
    primary_image_url TEXT NOT NULL,
    gallery_urls TEXT NOT NULL DEFAULT '[]',
    colors TEXT NOT NULL,
    sizes TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch('subsecond') * 1000)
  )`,
  `CREATE TABLE IF NOT EXISTS category_images (
    collection TEXT NOT NULL,
    category_slug TEXT NOT NULL,
    image_url TEXT NOT NULL,
    PRIMARY KEY (collection, category_slug)
  )`,
  `CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    object_key TEXT NOT NULL UNIQUE,
    bucket TEXT NOT NULL,
    mime_type TEXT,
    size_bytes INTEGER,
    public_url TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch('subsecond') * 1000)
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at INTEGER NOT NULL DEFAULT (unixepoch('subsecond') * 1000)
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    authority TEXT PRIMARY KEY,
    amount_tomans INTEGER NOT NULL,
    cart_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    ref_id TEXT,
    mobile TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch('subsecond') * 1000)
  )`,
  `CREATE TABLE IF NOT EXISTS otp_verifications (
    phone TEXT PRIMARY KEY,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_sent_at INTEGER NOT NULL
  )`,
];

const alterMigrations = [
  `ALTER TABLE users ADD COLUMN phone TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users(phone) WHERE phone IS NOT NULL`,
  `ALTER TABLE users ADD COLUMN full_name TEXT`,
  `ALTER TABLE users ADD COLUMN address TEXT`,
  `ALTER TABLE users ADD COLUMN postal_code TEXT`,
  `ALTER TABLE users ADD COLUMN city TEXT`,
  `ALTER TABLE payments ADD COLUMN user_id INTEGER`,
  `ALTER TABLE payments ADD COLUMN shipping_json TEXT`,
  `ALTER TABLE payments ADD COLUMN order_id INTEGER`,
];

const tableMigrations = [
  `CREATE TABLE IF NOT EXISTS customer_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    postal_code TEXT NOT NULL DEFAULT '',
    updated_at INTEGER NOT NULL DEFAULT (unixepoch('subsecond') * 1000)
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'awaiting_payment',
    amount_tomans INTEGER NOT NULL,
    shipping_full_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_city TEXT NOT NULL DEFAULT '',
    shipping_address TEXT NOT NULL,
    shipping_postal_code TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch('subsecond') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch('subsecond') * 1000)
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    unit_price_tomans INTEGER NOT NULL,
    quantity INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS orders_user_id_created_at ON orders(user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS order_items_order_id ON order_items(order_id)`,
];

function paymentStatusToOrderStatus(status: string): string {
  if (status === "paid") return "paid";
  if (status === "failed") return "failed";
  return "awaiting_payment";
}

function tableHasColumn(
  sqlite: Database.Database,
  table: string,
  column: string,
): boolean {
  const rows = sqlite.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  return rows.some((row) => row.name === column);
}

function backfillAccountTables(sqlite: Database.Database) {
  try {
    sqlite.exec(`
      INSERT INTO customer_profiles (user_id, full_name, city, address, postal_code, updated_at)
      SELECT
        id,
        coalesce(full_name, ''),
        coalesce(city, ''),
        coalesce(address, ''),
        coalesce(postal_code, ''),
        coalesce(created_at, unixepoch('subsecond') * 1000)
      FROM users
      WHERE phone IS NOT NULL AND role = 'customer'
      ON CONFLICT(user_id) DO NOTHING
    `);
  } catch {
    // customer_profiles may not exist yet on partial migrations
  }

  if (!tableHasColumn(sqlite, "payments", "order_id")) {
    return;
  }

  const paymentsWithoutOrder = sqlite
    .prepare(
      `SELECT authority, user_id, amount_tomans, cart_json, status, shipping_json, mobile, created_at
       FROM payments
       WHERE user_id IS NOT NULL AND order_id IS NULL`,
    )
    .all() as Array<{
    authority: string;
    user_id: number;
    amount_tomans: number;
    cart_json: string;
    status: string;
    shipping_json: string | null;
    mobile: string | null;
    created_at: number;
  }>;

  const insertOrder = sqlite.prepare(`
    INSERT INTO orders (
      user_id, status, amount_tomans,
      shipping_full_name, shipping_phone, shipping_city, shipping_address, shipping_postal_code,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = sqlite.prepare(`
    INSERT INTO order_items (
      order_id, product_slug, product_name, size, color, unit_price_tomans, quantity
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const linkPayment = sqlite.prepare(
    `UPDATE payments SET order_id = ? WHERE authority = ?`,
  );
  const productPrice = sqlite.prepare(
    `SELECT name, price FROM products WHERE slug = ? LIMIT 1`,
  );

  for (const payment of paymentsWithoutOrder) {
    let cart: Array<{
      productSlug: string;
      size: string;
      color: string;
      quantity: number;
    }> = [];
    try {
      cart = JSON.parse(payment.cart_json);
    } catch {
      continue;
    }
    if (!Array.isArray(cart) || cart.length === 0) continue;

    let shipping = {
      fullName: "",
      phone: payment.mobile ?? "",
      city: "",
      address: "",
      postalCode: "",
    };
    if (payment.shipping_json) {
      try {
        const parsed = JSON.parse(payment.shipping_json) as {
          fullName?: string;
          phone?: string;
          city?: string;
          address?: string;
          postalCode?: string;
        };
        shipping = {
          fullName: parsed.fullName ?? "",
          phone: parsed.phone ?? shipping.phone,
          city: parsed.city ?? "",
          address: parsed.address ?? "",
          postalCode: parsed.postalCode ?? "",
        };
      } catch {
        /* use defaults */
      }
    }

    const orderStatus = paymentStatusToOrderStatus(payment.status);
    const ts = payment.created_at ?? Date.now();
    const orderResult = insertOrder.run(
      payment.user_id,
      orderStatus,
      payment.amount_tomans,
      shipping.fullName || "—",
      shipping.phone || "—",
      shipping.city,
      shipping.address || "—",
      shipping.postalCode || "0000000000",
      ts,
      ts,
    );
    const orderId = Number(orderResult.lastInsertRowid);

    for (const line of cart) {
      const product = productPrice.get(line.productSlug) as
        | { name: string; price: number }
        | undefined;
      insertItem.run(
        orderId,
        line.productSlug,
        product?.name ?? line.productSlug,
        line.size,
        line.color,
        product?.price ?? 0,
        line.quantity,
      );
    }

    linkPayment.run(orderId, payment.authority);
  }
}

export function runMigrations() {
  const filePath = path.resolve(process.cwd(), getSqlitePath());
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  for (const sql of migrations) {
    sqlite.exec(sql);
  }
  for (const sql of tableMigrations) {
    sqlite.exec(sql);
  }
  for (const sql of alterMigrations) {
    try {
      sqlite.exec(sql);
    } catch {
      // column/index may already exist
    }
  }
  try {
    sqlite.exec(
      `CREATE INDEX IF NOT EXISTS payments_order_id ON payments(order_id)`,
    );
  } catch {
    // payments.order_id not added yet on very old DBs
  }
  backfillAccountTables(sqlite);
  try {
    syncAdminFromEnv(sqlite);
  } catch (err) {
    console.error("[migrate] syncAdminFromEnv failed:", err);
  }
  sqlite.close();
}
