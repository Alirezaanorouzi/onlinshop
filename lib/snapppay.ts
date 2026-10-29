import "server-only";

import { tomansToRials } from "@/lib/zarinpal";

export { tomansToRials };

/** Snapp stage/test eligible range (academy.snapppay.ir). */
export const SNAPP_PAY_MIN_RIALS = 40_000;
export const SNAPP_PAY_MAX_RIALS = 100_000_000;

export function isSnappPayAmountInEligibleRange(amountTomans: number): boolean {
  const rials = tomansToRials(amountTomans);
  return rials >= SNAPP_PAY_MIN_RIALS && rials <= SNAPP_PAY_MAX_RIALS;
}

type SnappPayJson = Record<string, unknown>;

let cachedAccessToken: string | null = null;
let tokenExpiresAtMs = 0;

export function getSnappPayClientId(): string {
  return process.env.SNAPPPAY_CLIENT_ID?.trim() ?? "";
}

export function getSnappPayClientSecret(): string {
  return process.env.SNAPPPAY_CLIENT_SECRET?.trim() ?? "";
}

export function getSnappPayUsername(): string {
  return process.env.SNAPPPAY_USERNAME?.trim() ?? "";
}

export function getSnappPayPassword(): string {
  return process.env.SNAPPPAY_PASSWORD?.trim() ?? "";
}

/** Production default; normalizes missing scheme and mistaken `/v1` suffix. */
export function getSnappPayBaseUrl(): string {
  let base =
    process.env.SNAPPPAY_BASE_URL?.trim() || "https://api.snapppay.ir";
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base.replace(/^\/+/, "")}`;
  }
  base = base.replace(/\/+$/, "");
  if (base.endsWith("/v1")) {
    base = base.slice(0, -3);
  }
  return base;
}

export function isSnappPayConfigured(): boolean {
  return (
    getSnappPayClientId().length > 0 &&
    getSnappPayClientSecret().length > 0 &&
    getSnappPayUsername().length > 0 &&
    getSnappPayPassword().length > 0
  );
}

export function formatSnappPayMobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("98") && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+98${digits.slice(1)}`;
  }
  if (digits.length >= 10) {
    return `+98${digits}`;
  }
  return phone.trim();
}

function snappPayUserAgent(): string {
  return `SnappPay, ${getSnappPayClientId()}`;
}

function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSnappPayBaseUrl()}${normalized}`;
}

function messageFromSnappPayBody(body: SnappPayJson): string {
  const err = body.errorData ?? body.message ?? body.error;
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return "خطای درگاه اسنپ‌پی";
}

async function snappPayFetch(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: string,
  retryOn401 = true,
): Promise<SnappPayJson> {
  const response = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  if (response.status === 401 && retryOn401) {
    cachedAccessToken = null;
    tokenExpiresAtMs = 0;
    const token = await snappPayGetAccessToken();
    headers.Authorization = `Bearer ${token}`;
    return snappPayFetch(method, url, headers, body, false);
  }

  let data: SnappPayJson;
  try {
    data = (await response.json()) as SnappPayJson;
  } catch {
    throw new Error("پاسخ نامعتبر از اسنپ‌پی");
  }

  if (!response.ok) {
    throw new Error(messageFromSnappPayBody(data));
  }

  return data;
}

export async function snappPayGetAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAtMs - 30_000) {
    return cachedAccessToken;
  }

  const basic = Buffer.from(
    `${getSnappPayClientId()}:${getSnappPayClientSecret()}`,
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type: "password",
    scope: "online-merchant",
    username: getSnappPayUsername(),
    password: getSnappPayPassword(),
  }).toString();

  const data = await snappPayFetch(
    "POST",
    apiUrl("/api/online/v1/oauth/token"),
    {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    false,
  );

  const accessToken = data.access_token;
  if (typeof accessToken !== "string" || !accessToken) {
    throw new Error("دریافت توکن اسنپ‌پی ناموفق بود");
  }

  cachedAccessToken = accessToken;
  const expiresIn =
    typeof data.expires_in === "number" ? data.expires_in : 3600;
  tokenExpiresAtMs = Date.now() + expiresIn * 1000;
  return accessToken;
}

async function bearerJsonRequest(
  method: string,
  path: string,
  jsonBody?: SnappPayJson,
): Promise<SnappPayJson> {
  const token = await snappPayGetAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": snappPayUserAgent(),
  };
  return snappPayFetch(
    method,
    apiUrl(path),
    headers,
    jsonBody ? JSON.stringify(jsonBody) : undefined,
  );
}

export type SnappPayEligible = {
  eligible: boolean;
  titleMessage?: string;
  description?: string;
};

export async function snappPayEligible(
  amountTomans: number,
): Promise<SnappPayEligible> {
  const amount = tomansToRials(amountTomans);
  const data = await bearerJsonRequest(
    "GET",
    `/api/online/offer/v1/eligible?amount=${amount}`,
  );

  if (data.successful !== true) {
    return { eligible: false };
  }

  const response = data.response as SnappPayJson | undefined;
  return {
    eligible: response?.eligible === true,
    titleMessage:
      typeof response?.title_message === "string"
        ? response.title_message
        : undefined,
    description:
      typeof response?.description === "string"
        ? response.description
        : undefined,
  };
}

export type SnappPayCartItem = {
  id: number;
  name: string;
  count: number;
  amount: number;
  category: string;
  commissionType: string;
};

export type SnappPayCartListEntry = {
  cartId: number;
  totalAmount: number;
  cartItems: SnappPayCartItem[];
  taxAmount: number;
  shippingAmount: number;
  isShipmentIncluded: boolean;
  isTaxIncluded: boolean;
};

export async function snappPayRequestPayment(input: {
  amountTomans: number;
  returnUrl: string;
  transactionId: string;
  mobile?: string;
  cartList: SnappPayCartListEntry[];
}): Promise<{ paymentToken: string; paymentPageUrl: string }> {
  const amount = tomansToRials(input.amountTomans);
  if (amount < 1000) {
    throw new Error("حداقل مبلغ پرداخت ۱۰۰ تومان است");
  }

  const payload: SnappPayJson = {
    amount,
    paymentMethodTypeDto: "INSTALLMENT",
    returnURL: input.returnUrl,
    transactionId: input.transactionId,
    discountAmount: 0,
    cartList: input.cartList,
  };

  if (input.mobile) {
    payload.mobile = formatSnappPayMobile(input.mobile);
  }

  const data = await bearerJsonRequest(
    "POST",
    "/api/online/payment/v1/token",
    payload,
  );

  if (data.successful !== true) {
    throw new Error(messageFromSnappPayBody(data));
  }

  const response = data.response as SnappPayJson | undefined;
  const paymentToken = response?.paymentToken;
  const paymentPageUrl = response?.paymentPageUrl;

  if (
    typeof paymentToken !== "string" ||
    !paymentToken ||
    typeof paymentPageUrl !== "string" ||
    !paymentPageUrl
  ) {
    throw new Error("درخواست پرداخت اسنپ‌پی ناموفق بود");
  }

  return { paymentToken, paymentPageUrl };
}

export async function snappPayVerifyAndSettle(paymentToken: string): Promise<{
  transactionId: string;
}> {
  const verifyData = await bearerJsonRequest(
    "POST",
    "/api/online/payment/v1/verify",
    { paymentToken },
  );

  if (verifyData.successful !== true) {
    throw new Error(messageFromSnappPayBody(verifyData));
  }

  const verifyResponse = verifyData.response as SnappPayJson | undefined;
  const transactionId = verifyResponse?.transactionId;

  const settleData = await bearerJsonRequest(
    "POST",
    "/api/online/payment/v1/settle",
    { paymentToken },
  );

  if (settleData.successful !== true) {
    throw new Error(messageFromSnappPayBody(settleData));
  }

  return {
    transactionId:
      typeof transactionId === "string" ? transactionId : paymentToken,
  };
}
