/** Store header/footer: full shop chrome vs minimal (account/login). */
export function isMinimalStoreChrome(pathname: string): boolean {
  return (
    pathname === "/account" ||
    pathname.startsWith("/login") ||
    pathname === "/cart/checkout"
  );
}

/** Admin uses its own nav — hide global store header and footer. */
export function hideStoreChrome(pathname: string): boolean {
  return pathname.startsWith("/admin");
}
