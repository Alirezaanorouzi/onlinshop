import "server-only";

import ZarinPal from "zarinpal-node-sdk";

export function getZarinpalMerchantId(): string {
  return process.env.ZARINPAL_MERCHANT_ID?.trim() ?? "";
}

export function getZarinpalAccessToken(): string {
  return process.env.ZARINPAL_ACCESS_TOKEN?.trim() ?? "";
}

export function isZarinpalConfigured(): boolean {
  return getZarinpalMerchantId().length > 0;
}

export function isZarinpalSandbox(): boolean {
  const value = process.env.ZARINPAL_SANDBOX?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

/** Shop prices are in تومان; ZarinPal SDK expects ریال. */
export function tomansToRials(tomans: number): number {
  return Math.round(tomans * 10);
}

let client: ZarinPal | null = null;

export function getZarinpalClient(): ZarinPal {
  const merchantId = getZarinpalMerchantId();
  if (!merchantId) {
    throw new Error("ZarinPal merchant id is not configured");
  }

  if (!client) {
    const accessToken = getZarinpalAccessToken();
    client = new ZarinPal({
      merchantId,
      sandbox: isZarinpalSandbox(),
      ...(accessToken ? { accessToken } : {}),
    });
  }

  return client;
}

type ZarinpalApiBody = {
  data?: { code?: number; message?: string; authority?: string; ref_id?: number };
  errors?: { message?: string }[];
};

function messageFromZarinpalError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const body = (err as { response?: { data?: ZarinpalApiBody } }).response
      ?.data;
    return (
      body?.errors?.[0]?.message ??
      body?.data?.message ??
      "خطای درگاه پرداخت"
    );
  }
  if (err instanceof Error) return err.message;
  return "خطای درگاه پرداخت";
}

export async function zarinpalRequestPayment(input: {
  amountTomans: number;
  callbackUrl: string;
  description: string;
  mobile?: string;
  email?: string;
}): Promise<{ authority: string; redirectUrl: string }> {
  const amount = tomansToRials(input.amountTomans);
  if (amount < 1000) {
    throw new Error("حداقل مبلغ پرداخت ۱۰۰ تومان است");
  }

  const zarinpal = getZarinpalClient();

  try {
    const response = (await zarinpal.payments.create({
      amount,
      callback_url: input.callbackUrl,
      description: input.description,
      mobile: input.mobile,
      email: input.email,
    })) as ZarinpalApiBody;

    const code = response.data?.code;
    const authority = response.data?.authority;
    if (code !== 100 || !authority) {
      throw new Error(response.data?.message ?? "درخواست پرداخت ناموفق بود");
    }

    return {
      authority,
      redirectUrl: zarinpal.payments.getRedirectUrl(authority),
    };
  } catch (err) {
    throw new Error(messageFromZarinpalError(err));
  }
}

export async function zarinpalVerifyPayment(input: {
  amountTomans: number;
  authority: string;
}): Promise<{ refId: number }> {
  const zarinpal = getZarinpalClient();
  const amount = tomansToRials(input.amountTomans);

  try {
    const response = (await zarinpal.verifications.verify({
      amount,
      authority: input.authority,
    })) as ZarinpalApiBody;

    const code = response.data?.code;
    const refId = response.data?.ref_id;
    if ((code !== 100 && code !== 101) || refId == null) {
      throw new Error(response.data?.message ?? "تأیید پرداخت ناموفق بود");
    }

    return { refId };
  } catch (err) {
    throw new Error(messageFromZarinpalError(err));
  }
}
