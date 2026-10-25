export function toLatinDigits(input: string): string {
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  return input.replace(/[۰-۹]/g, (ch) => String(persian.indexOf(ch))).replace(
    /[٠-٩]/g,
    (ch) => String(arabic.indexOf(ch)),
  );
}

/** Normalize Iranian mobile to `09xxxxxxxxx` for storage and Kavenegar. */
export function normalizeIranMobile(input: string): string | null {
  let s = toLatinDigits(input).replace(/[\s\u200c-]/g, "").trim();
  if (s.startsWith("+98")) s = `0${s.slice(3)}`;
  else if (s.startsWith("98") && s.length === 12) s = `0${s.slice(2)}`;
  else if (s.startsWith("9") && s.length === 10) s = `0${s}`;

  if (!/^09\d{9}$/.test(s)) return null;
  return s;
}

/** Ten-digit Iranian postal code (Persian/Arabic digits → Latin). */
export function normalizePostalCode(input: string): string {
  return toLatinDigits(input).replace(/\D/g, "").slice(0, 10);
}

export function formatIranMobileDisplay(phone: string): string {
  if (phone.length !== 11 || !phone.startsWith("09")) return phone;
  return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
}
