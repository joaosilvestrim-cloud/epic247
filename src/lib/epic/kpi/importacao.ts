import { DIMENSION_IDS } from "../dimensions";
import { chaveColuna, data, dataHora, inteiro, numero } from "./csv";

// Linhas de CSV → registros das entidades externas (Modelo de Dados §53,
// §54, §57). Puro: valida, normaliza e monta a chave de idempotência
// (source_record_id). Gravar é com o servidor.

export interface Falha {
  linha: number;
  erro: string;
}

type Linha = Record<string, string>;

/** Primeiro valor não vazio entre os nomes aceitos para a coluna. */
function pegar(l: Linha, nomes: string[]): string | null {
  for (const n of nomes) {
    const v = l[chaveColuna(n)];
    if (v != null && v.trim() !== "") return v.trim();
  }
  return null;
}

function deParaOu<T extends string>(v: string | null, mapa: Record<string, T>, validos: readonly T[]): T | null | undefined {
  if (!v) return null;
  const k = chaveColuna(v);
  if ((validos as readonly string[]).includes(k)) return k as T;
  return mapa[k]; // undefined = valor inválido
}

// ───────────── ContentPerformance ─────────────

export const PLATAFORMAS_CONTEUDO = ["instagram", "facebook", "linkedin", "youtube", "tiktok", "other"] as const;
export const TIPOS_CONTEUDO = ["reel", "story", "carousel", "static_post", "video", "article", "newsletter", "other"] as const;
export const UNIVERSOS_CONTEUDO = ["eu_me_vi_aqui", "ju_pensa", "historias", "cultura_explica_a_vida", "ferramentas", "movimento"] as const;

export interface LinhaConteudo {
  content_id: string;
  platform: (typeof PLATAFORMAS_CONTEUDO)[number];
  published_at: string | null;
  content_type: (typeof TIPOS_CONTEUDO)[number] | null;
  dimension: string | null;
  editorial_universe: (typeof UNIVERSOS_CONTEUDO)[number] | null;
  organic_or_paid: "organic" | "paid" | "hybrid";
  campaign_id: string | null;
  views: number | null;
  reach: number | null;
  impressions: number | null;
  watch_time_seconds: number | null;
  average_watch_time_seconds: number | null;
  retention_rate: number | null;
  saves: number | null;
  shares: number | null;
  comments: number | null;
  profile_visits: number | null;
  link_clicks: number | null;
  source_updated_at: string | null;
  source_record_id: string;
}

const PLATAFORMA_ALIAS: Record<string, (typeof PLATAFORMAS_CONTEUDO)[number]> = {
  ig: "instagram", insta: "instagram", fb: "facebook", meta: "facebook", yt: "youtube", li: "linkedin",
  outro: "other", outros: "other",
};
const TIPO_ALIAS: Record<string, (typeof TIPOS_CONTEUDO)[number]> = {
  reels: "reel", stories: "story", storie: "story", carrossel: "carousel", post: "static_post", foto: "static_post",
  imagem: "static_post", estatico: "static_post", artigo: "article", outro: "other",
};
const UNIVERSO_ALIAS: Record<string, (typeof UNIVERSOS_CONTEUDO)[number]> = {
  cultura: "cultura_explica_a_vida", eu_me_vi: "eu_me_vi_aqui",
};
const PAGO_ALIAS: Record<string, "organic" | "paid" | "hybrid"> = {
  organico: "organic", pago: "paid", ads: "paid", anuncio: "paid", impulsionado: "hybrid", hibrido: "hybrid",
};

/** Retenção em %: aceita "45%", "45", "0,45". */
function percentual(v: string | null): number | null {
  const n = numero(v);
  if (n == null) return null;
  const pct = !v!.includes("%") && n > 0 && n <= 1 ? n * 100 : n;
  return pct >= 0 && pct <= 100 ? Math.round(pct * 100) / 100 : null;
}

function dimensao(v: string | null): string | null | undefined {
  if (!v) return null;
  const k = chaveColuna(v);
  return (DIMENSION_IDS as readonly string[]).includes(k) ? k : undefined;
}

export function linhasConteudo(
  linhas: Linha[],
  padrao: { platform?: string } = {}
): { ok: LinhaConteudo[]; falhas: Falha[] } {
  const ok: LinhaConteudo[] = [];
  const falhas: Falha[] = [];
  linhas.forEach((l, i) => {
    const linha = i + 2; // 1 = cabeçalho
    // Mesmo formato do utm_content gravado na sessão (minúsculo), para a junção funcionar.
    const contentId = minusculoUtm(pegar(l, ["content_id", "utm_content", "codigo", "código", "id_do_conteudo"]));
    if (!contentId) return falhas.push({ linha, erro: "sem content_id" });
    const platform = deParaOu(pegar(l, ["platform", "plataforma", "canal"]) ?? padrao.platform ?? null, PLATAFORMA_ALIAS, PLATAFORMAS_CONTEUDO);
    if (!platform) return falhas.push({ linha, erro: "plataforma inválida" });
    const tipo = deParaOu(pegar(l, ["content_type", "tipo", "formato", "tipo_de_post"]), TIPO_ALIAS, TIPOS_CONTEUDO);
    if (tipo === undefined) return falhas.push({ linha, erro: "content_type inválido" });
    const universo = deParaOu(pegar(l, ["editorial_universe", "universo"]), UNIVERSO_ALIAS, UNIVERSOS_CONTEUDO);
    if (universo === undefined) return falhas.push({ linha, erro: "editorial_universe inválido" });
    const pago = deParaOu(pegar(l, ["organic_or_paid", "organico_ou_pago", "midia"]), PAGO_ALIAS, ["organic", "paid", "hybrid"] as const);
    if (pago === undefined) return falhas.push({ linha, erro: "organic_or_paid inválido" });
    const dim = dimensao(pegar(l, ["dimension", "dimensao", "dimensão"]));
    if (dim === undefined) return falhas.push({ linha, erro: "dimensão desconhecida" });
    const publicado = pegar(l, ["published_at", "data_de_publicacao", "horario_de_publicacao", "publicado_em", "data"]);
    const publishedAt = dataHora(publicado);
    if (publicado && !publishedAt) return falhas.push({ linha, erro: "published_at inválido" });
    const n = (nomes: string[]) => inteiro(pegar(l, nomes));
    ok.push({
      content_id: contentId,
      platform,
      published_at: publishedAt,
      content_type: tipo ?? null,
      dimension: dim ?? null,
      editorial_universe: universo ?? null,
      organic_or_paid: pago ?? "organic",
      campaign_id: pegar(l, ["campaign_id", "id_da_campanha", "identificacao_da_campanha"]),
      views: n(["views", "visualizacoes", "visualizações", "plays", "reproducoes"]),
      reach: n(["reach", "alcance", "contas_alcancadas"]),
      impressions: n(["impressions", "impressoes", "impressões"]),
      watch_time_seconds: numero(pegar(l, ["watch_time_seconds", "tempo_de_visualizacao_s", "tempo_assistido_s"])),
      average_watch_time_seconds: numero(pegar(l, ["average_watch_time_seconds", "tempo_medio_de_visualizacao_s", "tempo_medio_s"])),
      retention_rate: percentual(pegar(l, ["retention_rate", "retencao", "retenção", "taxa_de_retencao"])),
      saves: n(["saves", "salvamentos", "salvos"]),
      shares: n(["shares", "compartilhamentos"]),
      comments: n(["comments", "comentarios", "comentários"]),
      profile_visits: n(["profile_visits", "visitas_ao_perfil"]),
      link_clicks: n(["link_clicks", "cliques_no_link", "toques_no_link"]),
      source_updated_at: dataHora(pegar(l, ["source_updated_at", "atualizado_em"])),
      source_record_id: `${platform}:${contentId}`,
    });
  });
  return { ok, falhas };
}

// ───────────── CampaignPerformance ─────────────

export const PLATAFORMAS_MIDIA = ["meta", "google", "linkedin", "tiktok", "other"] as const;
const MIDIA_ALIAS: Record<string, (typeof PLATAFORMAS_MIDIA)[number]> = {
  facebook: "meta", instagram: "meta", meta_ads: "meta", facebook_ads: "meta", google_ads: "google",
  youtube: "google", linkedin_ads: "linkedin", tiktok_ads: "tiktok", outro: "other",
};

export interface LinhaCampanha {
  performance_date: string;
  platform: (typeof PLATAFORMAS_MIDIA)[number];
  account_id: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  adset_id: string | null;
  adset_name: string | null;
  ad_id: string | null;
  ad_name: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  spend: number;
  impressions: number | null;
  reach: number | null;
  clicks: number | null;
  landing_page_views: number | null;
  platform_leads: number | null;
  platform_purchases: number | null;
  fase: number | null;
  source_updated_at: string | null;
  source_record_id: string;
}

/** Lê também os parâmetros de URL do anúncio ("utm_campaign=x&utm_content=y"). */
function utmDaUrl(v: string | null, k: string): string | null {
  if (!v) return null;
  const m = v.match(new RegExp(`(?:^|[?&])${k}=([^&]+)`));
  if (!m) return null;
  try { return decodeURIComponent(m[1]).toLowerCase(); } catch { return m[1].toLowerCase(); }
}

export function linhasCampanha(
  linhas: Linha[],
  padrao: { platform?: string } = {}
): { ok: LinhaCampanha[]; falhas: Falha[] } {
  const ok: LinhaCampanha[] = [];
  const falhas: Falha[] = [];
  linhas.forEach((l, i) => {
    const linha = i + 2;
    const dia = data(pegar(l, ["performance_date", "dia", "data", "date", "day", "inicio_dos_relatorios", "reporting_starts"]));
    if (!dia) return falhas.push({ linha, erro: "sem data (performance_date)" });
    const platform = deParaOu(pegar(l, ["platform", "plataforma"]) ?? padrao.platform ?? "meta", MIDIA_ALIAS, PLATAFORMAS_MIDIA);
    if (!platform) return falhas.push({ linha, erro: "plataforma inválida" });
    const gasto = numero(pegar(l, ["spend", "valor_usado_brl", "valor_usado", "amount_spent_brl", "amount_spent", "gasto", "investido", "custo", "cost"]));
    if (gasto == null || gasto < 0) return falhas.push({ linha, erro: "spend ausente ou negativo" });
    const campaignName = pegar(l, ["campaign_name", "nome_da_campanha", "campanha", "campaign"]);
    const campaignId = pegar(l, ["campaign_id", "identificacao_da_campanha", "id_da_campanha"]);
    if (!campaignId && !campaignName) return falhas.push({ linha, erro: "sem campanha (campaign_id ou campaign_name)" });
    const tags = pegar(l, ["url_tags", "parametros_de_url", "parametros_url"]);
    const utm = (k: string, nomes: string[]) => minusculoUtm(pegar(l, nomes)) ?? utmDaUrl(tags, k);
    const adsetId = pegar(l, ["adset_id", "identificacao_do_conjunto_de_anuncios", "id_do_conjunto_de_anuncios"]);
    const adId = pegar(l, ["ad_id", "identificacao_do_anuncio", "id_do_anuncio"]);
    const fase = inteiro(pegar(l, ["fase"]));
    const n = (nomes: string[]) => inteiro(pegar(l, nomes));
    // Sem campaign_id, a chave usa o nome: renomear a campanha gera linha nova.
    const chaveCampanha = campaignId ?? `nome:${chaveColuna(campaignName!)}`;
    ok.push({
      performance_date: dia,
      platform,
      account_id: pegar(l, ["account_id", "identificacao_da_conta", "id_da_conta"]),
      campaign_id: chaveCampanha,
      campaign_name: campaignName,
      adset_id: adsetId,
      adset_name: pegar(l, ["adset_name", "nome_do_conjunto_de_anuncios", "conjunto_de_anuncios"]),
      ad_id: adId,
      ad_name: pegar(l, ["ad_name", "nome_do_anuncio", "anuncio"]),
      utm_source: utm("utm_source", ["utm_source"]),
      utm_medium: utm("utm_medium", ["utm_medium"]),
      utm_campaign: utm("utm_campaign", ["utm_campaign"]),
      utm_content: utm("utm_content", ["utm_content"]),
      spend: Math.round(gasto * 100) / 100,
      impressions: n(["impressions", "impressoes", "impressões"]),
      reach: n(["reach", "alcance"]),
      clicks: n(["clicks", "link_clicks", "cliques_no_link", "cliques", "cliques_todos"]),
      landing_page_views: n(["landing_page_views", "visualizacoes_da_pagina_de_destino"]),
      platform_leads: n(["platform_leads", "leads", "cadastros"]),
      platform_purchases: n(["platform_purchases", "compras", "purchases"]),
      fase: fase != null && fase >= 1 && fase <= 5 ? fase : null,
      source_updated_at: dataHora(pegar(l, ["source_updated_at", "atualizado_em"])),
      source_record_id: [dia, platform, chaveCampanha, adsetId ?? "", adId ?? ""].join("|"),
    });
  });
  return { ok, falhas };
}

const minusculoUtm = (v: string | null) => (v ? v.trim().toLowerCase().slice(0, 200) : null);

// ───────────── Receivable ─────────────

export const STATUS_RECEBIVEL = ["pending", "scheduled", "received", "overdue", "cancelled", "refunded", "chargeback"] as const;
export type StatusRecebivel = (typeof STATUS_RECEBIVEL)[number];
const RECEBIVEL_ALIAS: Record<string, StatusRecebivel> = {
  pendente: "pending", agendado: "scheduled", previsto: "scheduled", a_receber: "scheduled", recebido: "received",
  pago: "received", liquidado: "received", paid: "received", atrasado: "overdue", vencido: "overdue",
  cancelado: "cancelled", canceled: "cancelled", reembolsado: "refunded", estornado: "refunded",
};

export interface LinhaRecebivel {
  transaction_id: string;
  installment_number: number;
  installment_total: number;
  expected_amount: number;
  expected_date: string | null;
  received_amount: number | null;
  received_date: string | null;
  receivable_status: StatusRecebivel;
  fee_amount: number | null;
  net_received_amount: number | null;
  provider_receivable_id: string | null;
  source_updated_at: string | null;
  source_record_id: string;
}

/** Monta e valida um recebível (CSV ou formulário). */
export function recebivelDe(l: Linha): LinhaRecebivel | string {
  const tx = pegar(l, ["transaction_id", "pedido", "order_id", "id_da_venda", "venda"]);
  if (!tx) return "sem transaction_id";
  const parcela = inteiro(pegar(l, ["installment_number", "parcela", "numero_da_parcela"])) ?? 1;
  const total = inteiro(pegar(l, ["installment_total", "total_de_parcelas", "parcelas"])) ?? parcela;
  if (parcela < 1 || total < parcela) return "parcela inválida";
  const recebido = numero(pegar(l, ["received_amount", "valor_recebido"]));
  const liquidoRecebido = numero(pegar(l, ["net_received_amount", "liquido_recebido", "valor_liquido_recebido"]));
  const esperado = numero(pegar(l, ["expected_amount", "valor_previsto", "valor_esperado", "valor_liquido", "valor"])) ?? liquidoRecebido ?? recebido;
  if (esperado == null || esperado < 0) return "sem valor previsto (expected_amount)";
  const dataPrevistaBruta = pegar(l, ["expected_date", "data_prevista", "previsao", "previsão", "vencimento"]);
  const dataPrevista = data(dataPrevistaBruta);
  if (dataPrevistaBruta && !dataPrevista) return "expected_date inválida";
  const dataRecebidaBruta = pegar(l, ["received_date", "data_de_recebimento", "recebido_em", "data_recebimento"]);
  const dataRecebida = data(dataRecebidaBruta);
  if (dataRecebidaBruta && !dataRecebida) return "received_date inválida";
  const statusBruto = pegar(l, ["receivable_status", "status", "situacao", "situação"]);
  let status = deParaOu(statusBruto, RECEBIVEL_ALIAS, STATUS_RECEBIVEL);
  if (status === undefined) return "receivable_status inválido";
  status ??= dataRecebida ? "received" : dataPrevista ? "scheduled" : "pending";
  return {
    transaction_id: tx,
    installment_number: parcela,
    installment_total: total,
    expected_amount: Math.round(esperado * 100) / 100,
    expected_date: dataPrevista,
    received_amount: recebido,
    received_date: dataRecebida,
    receivable_status: status,
    fee_amount: numero(pegar(l, ["fee_amount", "taxa", "taxas"])),
    net_received_amount: liquidoRecebido,
    provider_receivable_id: pegar(l, ["provider_receivable_id", "id_do_recebivel"]),
    source_updated_at: dataHora(pegar(l, ["source_updated_at", "atualizado_em"])),
    source_record_id: `${tx}:${parcela}`,
  };
}

export function linhasRecebiveis(linhas: Linha[]): { ok: LinhaRecebivel[]; falhas: Falha[] } {
  const ok: LinhaRecebivel[] = [];
  const falhas: Falha[] = [];
  linhas.forEach((l, i) => {
    const r = recebivelDe(l);
    if (typeof r === "string") falhas.push({ linha: i + 2, erro: r });
    else ok.push(r);
  });
  return { ok, falhas };
}
