import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../db/index";
import { users } from "../db/schema";
import { getConfiguredAdminPhone } from "../lib/admin-phone";
import { runMigrations } from "../lib/migrate";
import { hashPassword } from "../lib/password";

function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();
process.env.CATALOG_BACKEND = "sqlite";

runMigrations();

const adminPhone = getConfiguredAdminPhone();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!adminPhone) {
  console.error(
    "Set ADMIN_PHONE in .env.local (e.g. 09121234567), then run: npm run db:seed-admin",
  );
  process.exit(1);
}

const adminEmail = email || `admin-${adminPhone.slice(1)}@phone.local`;
const passwordHash = password
  ? hashPassword(password)
  : hashPassword(randomBytes(32).toString("hex"));

const db = getDb();
const byPhone = db.select().from(users).where(eq(users.phone, adminPhone)).get();

if (byPhone) {
  db.update(users)
    .set({
      email: adminEmail,
      passwordHash,
      role: "admin",
    })
    .where(eq(users.id, byPhone.id))
    .run();
} else if (email) {
  const byEmail = db.select().from(users).where(eq(users.email, email)).get();
  if (byEmail) {
    db.update(users)
      .set({ phone: adminPhone, passwordHash, role: "admin" })
      .where(eq(users.id, byEmail.id))
      .run();
  } else {
    db.insert(users)
      .values({
        email: adminEmail,
        passwordHash,
        phone: adminPhone,
        role: "admin",
      })
      .run();
  }
} else {
  db.insert(users)
    .values({
      email: adminEmail,
      passwordHash,
      phone: adminPhone,
      role: "admin",
    })
    .run();
}

console.log(`Admin ready (OTP): ${adminPhone}`);
