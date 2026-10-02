import "server-only";
import { query } from "./db";

export interface ItemConteudo {
  id: string;
  content_type: "artigo" | "newsletter" | "video" | "repertorio";
  title: string;
  slug: string;
  excerpt: string | null;
  cover: string | null;
  body: string | null;
  video_url: string | null;
  dimension: string | null;
  author: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  universe?: string | null;
  featured?: boolean;
  og_image?: string | null;
}

/** Conteúdo publicado de Ideias. Banco fora do ar = lista vazia (RF-072). */
export async function listarConteudos(opts: { tipo?: string; dimensao?: string; limite?: number } = {}) {
  try {
    return await query<ItemConteudo>(
      `select id, content_type, title, slug, excerpt, cover, null as body, video_url, dimension, author,
              seo_title, seo_description, published_at
       from content_items
       where status = 'published' and published_at <= now()
         and ($1::text is null or content_type = $1)
         and ($2::text is null or dimension = $2)
       order by published_at desc
       limit $3`,
      [opts.tipo ?? null, opts.dimensao ?? null, opts.limite ?? 12]
    );
  } catch {
    return [];
  }
}

/** Destaque editorial de Ideias: escolhido no admin, não o mais recente (Copy Final §23.3). */
export async function listarDestaques(limite = 1) {
  try {
    return await query<ItemConteudo>(
      `select id, content_type, title, slug, excerpt, cover, null as body, video_url, dimension, author,
              seo_title, seo_description, published_at, universe, featured, og_image
       from content_items
       where status = 'published' and published_at <= now() and featured
       order by featured_order nulls last, published_at desc
       limit $1`,
      [limite]
    );
  } catch {
    return [];
  }
}

/** Minutos de leitura (texto) ou nada (vídeo usa a própria duração). */
export function minutosDeLeitura(body: string | null): number | null {
  if (!body) return null;
  const palavras = body.split(/\s+/).filter(Boolean).length;
  return palavras ? Math.max(1, Math.round(palavras / 200)) : null;
}

export async function buscarConteudo(slug: string) {
  try {
    const [row] = await query<ItemConteudo>(
      `select * from content_items where slug = $1 and status = 'published' and published_at <= now()`,
      [slug]
    );
    return row ?? null;
  } catch {
    return null;
  }
}

export const TIPO_LABEL: Record<ItemConteudo["content_type"], string> = {
  artigo: "Artigo",
  newsletter: "Newsletter",
  video: "Vídeo",
  repertorio: "Repertório",
};

export const TIPO_ROTA: Record<ItemConteudo["content_type"], string> = {
  artigo: "artigos",
  newsletter: "newsletter",
  video: "videos",
  repertorio: "repertorio",
};
