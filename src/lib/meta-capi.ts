import { createHash } from "node:crypto";

// Conversions API (servidor) do Meta. Envia eventos direto para o Graph,
// complementando o Pixel do navegador (melhor atribuição, resiste a adblock).

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export interface MetaEventOptions {
  email?: string;
  eventId?: string;
  value?: number;
  currency?: string;
  sourceUrl?: string;
  clientIp?: string;
  userAgent?: string;
}

export async function sendMetaEvent(
  eventName: string,
  opts: MetaEventOptions
): Promise<void> {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return; // não configurado: no-op

  const userData: Record<string, unknown> = {};
  if (opts.email) userData.em = [sha256(opts.email.trim().toLowerCase())];
  if (opts.clientIp) userData.client_ip_address = opts.clientIp;
  if (opts.userAgent) userData.client_user_agent = opts.userAgent;

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: opts.sourceUrl,
        event_id: opts.eventId,
        user_data: userData,
        custom_data:
          opts.value != null
            ? { value: opts.value, currency: opts.currency ?? "BRL" }
            : undefined,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixel}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      console.error("[capi] erro:", await res.text());
    }
  } catch (err) {
    console.error("[capi] falha de rede:", err);
  }
}
