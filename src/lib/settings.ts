import { cache } from "react";
import { getServiceClient } from "./supabase";

// Chaves de configuração dinâmica (editáveis pelo admin).
export const SETTING_KEYS = {
  heroVideoUrl: "hero_video_url",
  juPhotoUrl: "ju_photo_url",

  // ── Marketing / rastreamento ───────────────────────────────────────
  // Editáveis pela aba Marketing do /admin, sem precisar de deploy.
  metaPixelId: "meta_pixel_id",
  metaCapiToken: "meta_capi_token",
  ga4Id: "ga4_id",
  gtmId: "gtm_id",
  googleAdsId: "google_ads_id",
  googleAdsLabel: "google_ads_label",
  tiktokPixelId: "tiktok_pixel_id",
  linkedinPartnerId: "linkedin_partner_id",
} as const;

export interface SiteSettings {
  heroVideoUrl: string | null;
  juPhotoUrl: string | null;
}

/** IDs públicos de rastreamento. Vão para o HTML, não são segredo. */
export interface TrackingSettings {
  metaPixelId: string | null;
  ga4Id: string | null;
  gtmId: string | null;
  googleAdsId: string | null;
  googleAdsLabel: string | null;
  tiktokPixelId: string | null;
  linkedinPartnerId: string | null;
}

const EMPTY: SiteSettings = { heroVideoUrl: null, juPhotoUrl: null };

const EMPTY_TRACKING: TrackingSettings = {
  metaPixelId: null,
  ga4Id: null,
  gtmId: null,
  googleAdsId: null,
  googleAdsLabel: null,
  tiktokPixelId: null,
  linkedinPartnerId: null,
};

/** Normaliza: string vazia ou só espaço vira null. */
function limpa(value: string | undefined | null): string | null {
  const v = value?.trim();
  return v ? v : null;
}

/**
 * Lê a tabela inteira uma vez por request (`cache` do React deduplica).
 * Nunca lança: se o Supabase estiver fora, degrada para vazio e o site
 * continua no ar sem rastreamento.
 */
const lerMapa = cache(async (): Promise<Map<string, string>> => {
  const supabase = getServiceClient();
  if (!supabase) return new Map();

  const { data, error } = await supabase.from("settings").select("key, value");
  if (error || !data) return new Map();

  return new Map(data.map((row) => [row.key, row.value as string]));
});

/** Lê as configurações do site (servidor). Nunca lança. */
export async function getSettings(): Promise<SiteSettings> {
  const map = await lerMapa();
  if (map.size === 0) return EMPTY;
  return {
    heroVideoUrl: limpa(map.get(SETTING_KEYS.heroVideoUrl)),
    juPhotoUrl: limpa(map.get(SETTING_KEYS.juPhotoUrl)),
  };
}

/**
 * IDs de rastreamento. O banco tem prioridade; a env continua valendo como
 * fallback, então o que já estava configurado na Vercel não quebra.
 */
export async function getTracking(): Promise<TrackingSettings> {
  const map = await lerMapa();
  const envPixel = limpa(process.env.NEXT_PUBLIC_META_PIXEL_ID);
  const envGa4 = limpa(process.env.NEXT_PUBLIC_GA4_ID);

  if (map.size === 0) {
    return { ...EMPTY_TRACKING, metaPixelId: envPixel, ga4Id: envGa4 };
  }

  return {
    metaPixelId: limpa(map.get(SETTING_KEYS.metaPixelId)) ?? envPixel,
    ga4Id: limpa(map.get(SETTING_KEYS.ga4Id)) ?? envGa4,
    gtmId: limpa(map.get(SETTING_KEYS.gtmId)),
    googleAdsId: limpa(map.get(SETTING_KEYS.googleAdsId)),
    googleAdsLabel: limpa(map.get(SETTING_KEYS.googleAdsLabel)),
    tiktokPixelId: limpa(map.get(SETTING_KEYS.tiktokPixelId)),
    linkedinPartnerId: limpa(map.get(SETTING_KEYS.linkedinPartnerId)),
  };
}

/**
 * Token da Conversions API do Meta. É segredo: só use no servidor e nunca
 * passe como prop para componente de cliente.
 */
export async function getMetaCapiToken(): Promise<string | null> {
  const map = await lerMapa();
  return (
    limpa(map.get(SETTING_KEYS.metaCapiToken)) ??
    limpa(process.env.META_CAPI_TOKEN)
  );
}

/** Se o token da CAPI já está salvo, sem revelar o valor para o painel. */
export async function getMetaCapiTokenConfigurado(): Promise<boolean> {
  return (await getMetaCapiToken()) !== null;
}
