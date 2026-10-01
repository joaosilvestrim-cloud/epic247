import "server-only";
import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import type { Q } from "./db";

// Identidade do visitante (RF-017 a RF-019, RF-023/024).
// O lead_id vive num cookie httpOnly: o navegador nunca escolhe com quem
// está falando, e um lead_id forjado simplesmente não existe no banco.

export const COOKIE_LEAD = "epic_lid";
export const COOKIE_SESSION = "epic_sid";
const UM_ANO = 60 * 60 * 24 * 365;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface Atribuicao {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  landing_page: string | null;
  referrer: string | null;
}

const corta = (v: unknown, n = 200) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, n).toLowerCase() : null;

/** Normaliza o que veio do navegador. Nunca confiar em tamanho nem formato. */
export function atribuicaoDe(input: Record<string, unknown>): Atribuicao {
  return {
    source: corta(input.utm_source),
    medium: corta(input.utm_medium),
    campaign: corta(input.utm_campaign),
    content: corta(input.utm_content),
    term: corta(input.utm_term),
    landing_page: typeof input.landing_page === "string" ? input.landing_page.slice(0, 300) : null,
    referrer: typeof input.referrer === "string" ? input.referrer.slice(0, 300) : null,
  };
}

/**
 * Deduz origem quando não há utm (mesma regra do rastreio do site atual):
 * referrer externo vira fonte; sem nada, é acesso direto. Retorna null para
 * navegação interna, que não é um "toque" atribuível.
 */
export function origemDoToque(a: Atribuicao, hostProprio: string): Atribuicao | null {
  if (a.source) return a;
  if (!a.referrer) return null;
  let host = "";
  try {
    host = new URL(a.referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (!host || host === hostProprio || host.endsWith("epic247.com.br")) return null;
  const source = /instagram\./.test(host)
    ? "instagram"
    : /(^|\.)(facebook|fb)\./.test(host)
      ? "facebook"
      : /(^|\.)google\./.test(host)
        ? "google"
        : /linkedin\.|lnkd\.in/.test(host)
          ? "linkedin"
          : /youtube\.|youtu\.be/.test(host)
            ? "youtube"
            : host.replace(/^www\./, "");
  const medium = source === "google" ? "search" : "referral";
  return { ...a, source, medium };
}

async function leadVivo(q: Q, id: string): Promise<string | null> {
  // Segue merged_into: um lead absorvido aponta para o lead vivo.
  const rows = await q<{ lead_id: string; merged_into: string | null }>(
    "select lead_id, merged_into from leads where lead_id = $1",
    [id]
  );
  if (!rows[0]) return null;
  if (!rows[0].merged_into) return rows[0].lead_id;
  return leadVivo(q, rows[0].merged_into);
}

/** Lê o lead do cookie sem criar. */
export async function leadAtual(q: Q): Promise<string | null> {
  const id = (await cookies()).get(COOKIE_LEAD)?.value;
  if (!id || !UUID.test(id)) return null;
  return leadVivo(q, id);
}

/** Lê ou cria o lead anônimo e grava o cookie. */
export async function garantirLead(q: Q, toque: Atribuicao | null): Promise<string> {
  const existente = await leadAtual(q);
  if (existente) {
    await q("update leads set last_activity_at = now() where lead_id = $1", [existente]);
    await (await cookies()).set(COOKIE_LEAD, existente, cookieOpts(UM_ANO));
    return existente;
  }
  const t = toque ?? {
    source: "direct", medium: "direct", campaign: null, content: null, term: null,
    landing_page: null, referrer: null,
  };
  const [row] = await q<{ lead_id: string }>(
    `insert into leads (
       first_touch_source, first_touch_medium, first_touch_campaign, first_touch_content,
       first_touch_term, first_touch_landing_page, first_touch_at,
       last_touch_source, last_touch_medium, last_touch_campaign, last_touch_content,
       last_touch_term, last_touch_landing_page, last_touch_at)
     values ($1,$2,$3,$4,$5,$6, now(), $1,$2,$3,$4,$5,$6, now())
     returning lead_id`,
    [t.source, t.medium, t.campaign, t.content, t.term, t.landing_page]
  );
  (await cookies()).set(COOKIE_LEAD, row.lead_id, cookieOpts(UM_ANO));
  return row.lead_id;
}

/** Atualiza last-touch (first-touch é protegido por trigger). */
export async function registrarToque(q: Q, leadId: string, t: Atribuicao) {
  await q(
    `update leads set
       last_touch_source = $2, last_touch_medium = $3, last_touch_campaign = $4,
       last_touch_content = $5, last_touch_term = $6, last_touch_landing_page = $7,
       last_touch_at = now(), last_activity_at = now()
     where lead_id = $1`,
    [leadId, t.source, t.medium, t.campaign, t.content, t.term, t.landing_page]
  );
}

/** Sessão: um id por aba/visita, cookie de sessão do navegador. */
export async function sessaoAtual(): Promise<string | null> {
  const id = (await cookies()).get(COOKIE_SESSION)?.value;
  return id && UUID.test(id) ? id : null;
}

export async function abrirSessao(q: Q, leadId: string, t: Atribuicao): Promise<string> {
  const atual = await sessaoAtual();
  if (atual) {
    const rows = await q("select 1 from sessions where session_id = $1", [atual]);
    if (rows.length) return atual;
  }
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  const id = randomUUID();
  const dec = (v: string | null) => {
    if (!v) return null;
    try { return decodeURIComponent(v).slice(0, 80); } catch { return v.slice(0, 80); }
  };
  await q(
    `insert into sessions (session_id, lead_id, landing_page, referrer, utm_source, utm_medium,
       utm_campaign, utm_content, utm_term, device, os, in_app, country, region, city)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [
      id, leadId, t.landing_page, t.referrer, t.source, t.medium, t.campaign, t.content, t.term,
      dispositivo(ua), sistema(ua), app(ua),
      dec(h.get("x-vercel-ip-country")), dec(h.get("x-vercel-ip-country-region")), dec(h.get("x-vercel-ip-city")),
    ]
  );
  (await cookies()).set(COOKIE_SESSION, id, { ...cookieOpts(), maxAge: undefined });
  return id;
}

/**
 * Associa o e-mail ao lead (RF-017). Se o e-mail já pertence a outra
 * pessoa, o histórico anônimo é movido para ela e o lead atual é marcado
 * como absorvido: nada se perde e nada se duplica.
 */
export async function identificar(
  q: Q,
  leadAtualId: string,
  dados: { email: string; firstName: string | null }
): Promise<string> {
  const email = dados.email.trim().toLowerCase();
  const [dono] = await q<{ lead_id: string }>(
    "select lead_id from leads where lower(email) = $1 and merged_into is null and lead_id <> $2",
    [email, leadAtualId]
  );

  if (!dono) {
    await q(
      `update leads set email = $2, first_name = coalesce($3, first_name), last_activity_at = now()
       where lead_id = $1`,
      [leadAtualId, email, dados.firstName]
    );
    return leadAtualId;
  }

  const destino = dono.lead_id;
  for (const tabela of ["map_results", "sessions", "events", "transactions", "plan_generations",
    "mentoring_applications", "contact_messages"]) {
    await q(`update ${tabela} set lead_id = $1 where lead_id = $2`, [destino, leadAtualId]);
  }
  await q(`update messages set lead_id = $1 where lead_id = $2 and status = 'scheduled'`, [destino, leadAtualId]);
  // Resumo de Mapas e estágio: o destino herda o que o anônimo avançou.
  await q(
    `update leads d set
       first_name = coalesce($3, d.first_name),
       maps_completed_count = d.maps_completed_count + o.maps_completed_count,
       first_map = coalesce(d.first_map, o.first_map),
       last_map = coalesce(o.last_map, d.last_map),
       first_primary_dimension = coalesce(d.first_primary_dimension, o.first_primary_dimension),
       latest_primary_dimension = coalesce(o.latest_primary_dimension, d.latest_primary_dimension),
       latest_secondary_dimension = coalesce(o.latest_secondary_dimension, d.latest_secondary_dimension),
       last_primary_pattern = coalesce(o.last_primary_pattern, d.last_primary_pattern),
       last_secondary_pattern = coalesce(o.last_secondary_pattern, d.last_secondary_pattern),
       last_activity_at = now()
     from leads o where d.lead_id = $1 and o.lead_id = $2`,
    [destino, leadAtualId, dados.firstName]
  );
  const [estagio] = await q<{ lifecycle_stage: string }>(
    "select lifecycle_stage from leads where lead_id = $1", [leadAtualId]
  );
  if (estagio) await q("select promote_lifecycle($1, $2)", [destino, estagio.lifecycle_stage]);
  await q("update leads set merged_into = $1 where lead_id = $2", [destino, leadAtualId]);
  (await cookies()).set(COOKIE_LEAD, destino, cookieOpts(UM_ANO));
  return destino;
}

function cookieOpts(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  };
}

function app(ua: string) {
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return "facebook";
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return "tiktok";
  if (/LinkedInApp/i.test(ua)) return "linkedin";
  return null;
}
function sistema(ua: string) {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "mac";
  if (/Linux/i.test(ua)) return "linux";
  return null;
}
function dispositivo(ua: string) {
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "celular";
  return "computador";
}

export const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp\/|headless|lighthouse/i;

export function emailValido(v: unknown): v is string {
  return typeof v === "string" && v.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim());
}
