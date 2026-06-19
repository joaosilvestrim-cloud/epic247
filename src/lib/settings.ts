import { getServiceClient } from "./supabase";

// Chaves de configuração dinâmica (editáveis pelo admin).
export const SETTING_KEYS = {
  heroVideoUrl: "hero_video_url",
  juPhotoUrl: "ju_photo_url",
} as const;

export interface SiteSettings {
  heroVideoUrl: string | null;
  juPhotoUrl: string | null;
}

const EMPTY: SiteSettings = { heroVideoUrl: null, juPhotoUrl: null };

/** Lê as configurações do site (servidor). Nunca lança — degrada para vazio. */
export async function getSettings(): Promise<SiteSettings> {
  const supabase = getServiceClient();
  if (!supabase) return EMPTY;

  const { data, error } = await supabase
    .from("settings")
    .select("key, value");

  if (error || !data) return EMPTY;

  const map = new Map(data.map((row) => [row.key, row.value as string]));
  return {
    heroVideoUrl: map.get(SETTING_KEYS.heroVideoUrl) ?? null,
    juPhotoUrl: map.get(SETTING_KEYS.juPhotoUrl) ?? null,
  };
}
