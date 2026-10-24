import { apiPath } from "@/lib/api-path";

export type ClientAuthUser = {
  email: string;
  phone?: string | null;
  role: string;
};

export const AUTH_SESSION_EVENT = "auth-session-changed";

export function notifyAuthSessionChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
  }
}

export async function fetchAuthSession(): Promise<ClientAuthUser | null> {
  const response = await fetch(apiPath("/api/auth/session"), {
    credentials: "include",
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { user?: ClientAuthUser | null };
  return data.user ?? null;
}

export async function logoutAuthSession() {
  await fetch(apiPath("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  });
  notifyAuthSessionChanged();
}
