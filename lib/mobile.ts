/** Iranian mobile: 11 digits starting with 09 */
export function normalizeIranMobile(
  value: string | undefined,
): string | undefined {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length === 11 && digits.startsWith("09")) return digits;
  return undefined;
}

export function isValidIranMobile(value: string): boolean {
  return normalizeIranMobile(value) !== undefined;
}
