import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";

export function findUserByEmail(email: string) {
  const db = getDb();
  return db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
}

/** Legacy email/password admin login (`/api/auth/login`) and local verify script. */
export function verifyUserPassword(
  email: string,
  password: string,
): { id: number; email: string; role: string } | null {
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, email: user.email, role: user.role };
}
