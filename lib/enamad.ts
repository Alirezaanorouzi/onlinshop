import { getPublicSiteUrl } from "@/lib/site-url";

/** کد HTML کامل اینماد از پنل — بدون تغییر در ENAMAD_EMBED / INAMAD_LOGO */
function readEnamadEmbedHtml(): string | undefined {
  const raw =
    process.env.ENAMAD_EMBED?.trim() ||
    process.env.INAMAD_LOGO?.trim() ||
    process.env.ENAMAD_LOGO?.trim();
  return raw || undefined;
}

export function parseEnamadEmbed(html: string): {
  href: string;
  src: string;
  code?: string;
} | null {
  const hrefMatch = html.match(/href=['"]([^'"]+)['"]/i);
  const srcMatch = html.match(/src=['"]([^'"]+)['"]/i);
  const codeMatch = html.match(/\bcode=['"]([^'"]+)['"]/i);
  if (!hrefMatch?.[1] || !srcMatch?.[1]) return null;
  return {
    href: hrefMatch[1],
    src: srcMatch[1],
    code: codeMatch?.[1],
  };
}

function readId(): string {
  return (
    process.env.ENAMAD_ID?.trim() ||
    process.env.NEXT_PUBLIC_ENAMAD_ID?.trim() ||
    "8260060"
  );
}

function readCode(): string {
  const fromEmbed = readEnamadEmbedHtml();
  if (fromEmbed) {
    const parsed = parseEnamadEmbed(fromEmbed);
    if (parsed?.code) return parsed.code;
  }
  return (
    process.env.ENAMAD_CODE?.trim() ||
    process.env.NEXT_PUBLIC_ENAMAD_CODE?.trim() ||
    "FSCl7Qeoo5WZcnsXTkdA70U0YHQS0NnW"
  );
}

export const enamad = { id: readId(), code: readCode() };

export type EnamadUrls = {
  trustUrl: string;
  logoUrl: string;
  code: string;
};

export function getEnamadUrls(): EnamadUrls {
  const embed = readEnamadEmbedHtml();
  if (embed) {
    const parsed = parseEnamadEmbed(embed);
    if (parsed) {
      return {
        trustUrl: parsed.href,
        logoUrl: parsed.src,
        code: parsed.code ?? readCode(),
      };
    }
  }

  const trustOverride =
    process.env.ENAMAD_TRUST_URL?.trim() ||
    process.env.NEXT_PUBLIC_ENAMAD_TRUST_URL?.trim();
  const logoOverride =
    process.env.ENAMAD_LOGO_URL?.trim() ||
    process.env.NEXT_PUBLIC_ENAMAD_LOGO_URL?.trim();

  const { id, code } = enamad;
  return {
    trustUrl:
      trustOverride ??
      `https://trustseal.enamad.ir/?id=${id}&Code=${code}`,
    logoUrl:
      logoOverride ??
      `https://trustseal.enamad.ir/logo.aspx?id=${id}&Code=${code}`,
    code,
  };
}

/** قالب رسمی پنل اینماد (وقتی فقط URLها در env هستند). */
export function buildOfficialEnamadEmbed(urls: EnamadUrls): string {
  return `<a referrerpolicy='origin' target='_blank' href='${urls.trustUrl}'><img referrerpolicy='origin' src='${urls.logoUrl}' alt='' style='cursor:pointer' code='${urls.code}'></a>`;
}

/** فقط rel= را حذف می‌کند (مثلاً noreferrer) — بقیهٔ کد دست‌نخورده می‌ماند. */
export function stripRelFromEnamadHtml(html: string): string {
  return html.replace(/\s+rel\s*=\s*['"][^'"]*['"]/gi, "");
}

/** HTML فوتر: اولویت با کد خام env؛ بدون پروکسی و بدون React روی تگ‌های img/a. */
export function getEnamadFooterHtml(): string {
  const fromPanel = readEnamadEmbedHtml();
  const html = fromPanel ?? buildOfficialEnamadEmbed(getEnamadUrls());
  return stripRelFromEnamadHtml(html);
}

export function enamadRefererOrigin(request?: Request): string {
  const fromEnv =
    process.env.ENAMAD_REFERER?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return getPublicSiteUrl(request);
}
