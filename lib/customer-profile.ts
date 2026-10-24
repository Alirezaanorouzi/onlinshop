import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { customerProfiles, users } from "@/db/schema";

export type CustomerProfile = {
  phone: string | null;
  fullName: string;
  address: string;
  postalCode: string;
  city: string;
};

function rowToProfile(
  phone: string | null,
  row: {
    fullName: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
  } | null,
  legacy?: {
    fullName: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
  },
): CustomerProfile {
  const source = row ?? legacy;
  return {
    phone,
    fullName: source?.fullName?.trim() ?? "",
    address: source?.address?.trim() ?? "",
    postalCode: source?.postalCode?.trim() ?? "",
    city: source?.city?.trim() ?? "",
  };
}

export function getCustomerProfile(userId: number): CustomerProfile | null {
  const db = getDb();
  const user = db
    .select({
      phone: users.phone,
      fullName: users.fullName,
      address: users.address,
      postalCode: users.postalCode,
      city: users.city,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();
  if (!user) return null;

  const profile = db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .get();

  return rowToProfile(user.phone, profile ?? null, user);
}

export function isProfileComplete(profile: CustomerProfile): boolean {
  return Boolean(
    profile.phone &&
      profile.fullName.length >= 2 &&
      profile.address.length >= 5 &&
      /^\d{10}$/.test(profile.postalCode.replace(/\D/g, "")),
  );
}

export function updateCustomerProfile(
  userId: number,
  input: {
    fullName: string;
    address: string;
    postalCode: string;
    city?: string;
  },
): CustomerProfile | null {
  const fullName = input.fullName.trim();
  const address = input.address.trim();
  const postalDigits = input.postalCode.replace(/\D/g, "");
  const city = input.city?.trim() ?? "";

  if (fullName.length < 2) {
    throw new Error("نام و نام خانوادگی را وارد کنید.");
  }
  if (address.length < 5) {
    throw new Error("آدرس کامل پستی را وارد کنید.");
  }
  if (postalDigits.length !== 10) {
    throw new Error("کد پستی باید ۱۰ رقم باشد.");
  }

  const db = getDb();
  const updatedAt = new Date();
  db.insert(customerProfiles)
    .values({
      userId,
      fullName,
      address,
      postalCode: postalDigits,
      city,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: customerProfiles.userId,
      set: {
        fullName,
        address,
        postalCode: postalDigits,
        city,
        updatedAt,
      },
    })
    .run();

  // Keep users columns in sync for legacy reads / admin tooling.
  db.update(users)
    .set({
      fullName,
      address,
      postalCode: postalDigits,
      city,
    })
    .where(eq(users.id, userId))
    .run();

  return getCustomerProfile(userId);
}
