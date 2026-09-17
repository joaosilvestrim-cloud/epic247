import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { SETTING_KEYS } from "@/lib/settings";

const ALLOWED = new Set<string>(Object.values(SETTING_KEYS));

/**
 * Validação por chave. Evita o erro clássico de colar o ID no campo errado
 * (o GA4 no campo do GTM, por exemplo), que faz o rastreamento sumir sem
 * nenhuma mensagem de erro. Valor vazio sempre passa: é como se limpa o campo.
 */
const REGRAS: Record<string, { teste: RegExp; ajuda: string }> = {
  [SETTING_KEYS.metaPixelId]: {
    teste: /^\d{10,20}$/,
    ajuda: "O Pixel do Meta é só números, entre 10 e 20 dígitos.",
  },
  [SETTING_KEYS.ga4Id]: {
    teste: /^G-[A-Z0-9]{6,12}$/i,
    ajuda: "O ID do GA4 começa com G-, por exemplo G-ABC123XYZ.",
  },
  [SETTING_KEYS.gtmId]: {
    teste: /^GTM-[A-Z0-9]{4,10}$/i,
    ajuda: "O ID do Tag Manager começa com GTM-, por exemplo GTM-ABC1234.",
  },
  [SETTING_KEYS.googleAdsId]: {
    teste: /^AW-\d{8,14}$/i,
    ajuda: "O ID do Google Ads começa com AW-, por exemplo AW-123456789.",
  },
  [SETTING_KEYS.tiktokPixelId]: {
    teste: /^[A-Z0-9]{15,30}$/i,
    ajuda: "O Pixel do TikTok é um código de letras e números, sem espaços.",
  },
  [SETTING_KEYS.linkedinPartnerId]: {
    teste: /^\d{4,12}$/,
    ajuda: "O Partner ID do LinkedIn é só números.",
  },
  [SETTING_KEYS.metaCapiToken]: {
    teste: /^[A-Za-z0-9_-]{40,400}$/,
    ajuda: "O token da Conversions API é um código longo, sem espaços.",
  },
};

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { key, value } = (body ?? {}) as { key?: unknown; value?: unknown };
  if (typeof key !== "string" || !ALLOWED.has(key)) {
    return NextResponse.json({ error: "Chave inválida." }, { status: 400 });
  }
  if (typeof value !== "string") {
    return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
  }

  const limpo = value.trim();
  const regra = REGRAS[key];
  if (limpo && regra && !regra.teste.test(limpo)) {
    return NextResponse.json({ error: regra.ajuda }, { status: 400 });
  }

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key, value: limpo, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
