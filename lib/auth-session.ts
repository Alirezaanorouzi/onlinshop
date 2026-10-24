import "server-only";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { sessions, users } from "@/db/schema";
import { reconcileUserRole } from "@/lib/admin-role";
import { parseCookies, SESSION_COOKIE } from "@/lib/auth-cookie";
import { isSqliteCatalog } from "@/lib/env";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: number;
  email: string;
  phone: string | null;
  role: string;
};

export function getSessionUser(request: Request): SessionUser | null {
  if (!isSqliteCatalog()) return null;
  const cookies = parseCookies(request.headers.get("cookie"));
  const sessionId = cookies[SESSION_COOKIE]?.trim();
  if (!sessionId) return null;

  const db = getDb();
  const now = new Date();
  const row = db
    .select({
      id: users.id,
      email: users.email,
      phone: users.phone,
      role: users.role,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .get();

  if (!row || row.expiresAt < now) {
    if (row) {
      db.delete(sessions).where(eq(sessions.id, sessionId)).run();
    }
    return null;
  }

  const role = reconcileUserRole({
    id: row.id,
    phone: row.phone ?? null,
    role: row.role,
  });

  return {
    id: row.id,
    email: row.email,
    phone: row.phone ?? null,
    role,
  };
}

export function createSession(userId: number): string {
  const db = getDb();
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  db.insert(sessions).values({ id, userId, expiresAt }).run();
  return id;
}

export function deleteSession(sessionId: string) {
  const db = getDb();
  db.delete(sessions).where(eq(sessions.id, sessionId)).run();
}

export function deleteSessionFromRequest(request: Request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const sessionId = cookies[SESSION_COOKIE]?.trim();
  if (sessionId) deleteSession(sessionId);
}

export function sessionMaxAgeSeconds() {
  return Math.floor(SESSION_TTL_MS / 1000);
}
