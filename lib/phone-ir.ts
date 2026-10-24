/** Normalize Iranian mobile to `09xxxxxxxxx` for storage and Kavenegar. */
export function normalizeIranMobile(input: string): string | null {
  let s = input.replace(/[\s\u200c-]/g, "").trim();
  if (s.startsWith("+98")) s = `0${s.slice(3)}`;
  else if (s.startsWith("98") && s.length === 12) s = `0${s.slice(2)}`;
  else if (s.startsWith("9") && s.length === 10) s = `0${s}`;

  if (!/^09\d{9}$/.test(s)) return null;
  return s;
}

export function formatIranMobileDisplay(phone: string): string {
  if (phone.length !== 11 || !phone.startsWith("09")) return phone;
  return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
}
