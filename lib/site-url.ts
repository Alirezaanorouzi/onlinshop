function isLocalHost(host: string): boolean {
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.endsWith(".local") ||
    h.startsWith("192.168.") ||
    h.startsWith("10.")
  );
}

function siteUrlFromRequest(request: Request): string | null {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return null;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (isLocalHost(host) ? "http" : "https");
  return `${proto}://${host}`.replace(/\/$/, "");
}

/** Public site URL for payment callbacks (no trailing slash). */
export function getPublicSiteUrl(request?: Request): string {
  // Local dev: always use the current host so Zarinpal callback returns here,
  // even when SITE_URL points at production (common in .env.local).
  if (request) {
    const fromRequest = siteUrlFromRequest(request);
    if (fromRequest && isLocalHost(fromRequest)) {
      return fromRequest;
    }
  }

  const fromEnv =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (request) {
    const fromRequest = siteUrlFromRequest(request);
    if (fromRequest) return fromRequest;
  }

  return "http://localhost:3000";
}
