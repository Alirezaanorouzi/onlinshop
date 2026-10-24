import "server-only";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { users } from "@/db/schema";
import { isConfiguredAdminPhone } from "@/lib/admin-phone";
import { normalizeIranMobile } from "@/lib/phone-ir";
import { hashPassword } from "@/lib/password";

function randomPasswordHash() {
  return hashPassword(randomBytes(32).toString("hex"));
}

function adminEmailForPhone(phone: string) {
  const fromEnv = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (fromEnv) return fromEnv;
  return `admin-${phone.slice(1)}@phone.local`;
}

/** After OTP verify: load or create user (admin if phone matches ADMIN_PHONE). */
export function findOrCreateUserByPhone(rawPhone: string) {
  const phone = normalizeIranMobile(rawPhone);
  if (!phone) {
    return { ok: false as const, error: "شماره موبایل معتبر نیست." };
  }

  const db = getDb();
  const asAdmin = isConfiguredAdminPhone(phone);

  const existing = db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .get();

  if (existing) {
    if (!asAdmin && existing.role === "admin") {
      db.update(users)
        .set({ role: "customer" })
        .where(eq(users.id, existing.id))
        .run();
      const demoted = db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .get();
      if (!demoted) {
        return { ok: false as const, error: "به‌روزرسانی حساب ناموفق بود." };
      }
      return { ok: true as const, user: demoted };
    }

    if (asAdmin && existing.role !== "admin") {
      const targetEmail = adminEmailForPhone(phone);
      const emailOwner = db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, targetEmail))
        .get();
      if (emailOwner && emailOwner.id !== existing.id) {
        db.update(users)
          .set({
            email: `legacy-${emailOwner.id}@phone.local`,
            role: "customer",
          })
          .where(eq(users.id, emailOwner.id))
          .run();
      }
      db.update(users)
        .set({ role: "admin", email: targetEmail })
        .where(eq(users.id, existing.id))
        .run();
      const updated = db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .get();
      if (!updated) {
        return { ok: false as const, error: "به‌روزرسانی حساب مدیر ناموفق بود." };
      }
      return { ok: true as const, user: updated };
    }
    return { ok: true as const, user: existing };
  }

  const email = asAdmin ? adminEmailForPhone(phone) : `u${phone.slice(1)}@phone.local`;
  const role = asAdmin ? "admin" : "customer";

  if (asAdmin) {
    const legacy = db.select().from(users).where(eq(users.email, email)).get();
    if (legacy) {
      db.update(users)
        .set({
          email: `legacy-${legacy.id}@phone.local`,
          role: "customer",
        })
        .where(eq(users.id, legacy.id))
        .run();
    }
  }

  db.insert(users)
    .values({
      email,
      passwordHash: randomPasswordHash(),
      phone,
      role,
    })
    .run();

  const user = db.select().from(users).where(eq(users.phone, phone)).get();
  if (!user) {
    return { ok: false as const, error: "ایجاد حساب ناموفق بود." };
  }
  return { ok: true as const, user };
}
