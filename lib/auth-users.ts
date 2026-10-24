import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { users } from "@/db/schema";
import { findOrCreateUserByPhone as findOrCreateUserByPhoneImpl } from "@/lib/otp-login-user";
import { hashPassword, verifyPassword } from "@/lib/password";

export function findUserByPhone(phone: string) {
  const db = getDb();
  return db.select().from(users).where(eq(users.phone, phone)).get();
}

export function findOrCreateUserByPhone(rawPhone: string) {
  return findOrCreateUserByPhoneImpl(rawPhone);
}

/** @deprecated Use findOrCreateUserByPhone */
export function findOrCreateCustomerByPhone(phone: string) {
  return findOrCreateUserByPhoneImpl(phone);
}

export function findUserByEmail(email: string) {
  const db = getDb();
  return db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
}

export function verifyUserPassword(
  email: string,
  password: string,
): { id: number; email: string; role: string } | null {
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, email: user.email, role: user.role };
}

export function upsertAdminUser(email: string, password: string) {
  const db = getDb();
  const normalized = email.toLowerCase().trim();
  const passwordHash = hashPassword(password);
  const existing = findUserByEmail(normalized);
  if (existing) {
    db.update(users)
      .set({ passwordHash, role: "admin" })
      .where(eq(users.id, existing.id))
      .run();
    return existing.id;
  }
  db.insert(users)
    .values({
      email: normalized,
      passwordHash,
      role: "admin",
    })
    .run();
  return findUserByEmail(normalized)!.id;
}
