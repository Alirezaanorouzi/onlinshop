import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { users } from "@/db/schema";
import { getConfiguredAdminPhone } from "@/lib/admin-phone";
import { normalizeIranMobile } from "@/lib/phone-ir";

/** Env `ADMIN_PHONE` is the only phone allowed `admin` when set. */
export function reconcileUserRole(
  user: { id: number; phone: string | null; role: string },
): string {
  const configuredAdmin = getConfiguredAdminPhone();
  if (!configuredAdmin) {
    return user.role;
  }

  const phone = user.phone ? normalizeIranMobile(user.phone) : null;
  const shouldBeAdmin = Boolean(phone && phone === configuredAdmin);

  if (user.role === "admin" && !shouldBeAdmin) {
    getDb()
      .update(users)
      .set({ role: "customer" })
      .where(eq(users.id, user.id))
      .run();
    return "customer";
  }

  if (shouldBeAdmin && user.role !== "admin") {
    getDb()
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, user.id))
      .run();
    return "admin";
  }

  return user.role;
}
