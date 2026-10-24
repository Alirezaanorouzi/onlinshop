import { normalizeIranMobile } from "@/lib/phone-ir";

/** Admin store owner phone (OTP login). Set ADMIN_PHONE in env, e.g. 09121234567 */
export function getConfiguredAdminPhone(): string | null {
  const raw = process.env.ADMIN_PHONE?.trim();
  if (!raw) return null;
  return normalizeIranMobile(raw);
}

export function isConfiguredAdminPhone(phone: string): boolean {
  const adminPhone = getConfiguredAdminPhone();
  if (!adminPhone) return false;
  const normalized = normalizeIranMobile(phone);
  return normalized === adminPhone;
}
