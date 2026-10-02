import "server-only";
import { exigirAdmin } from "./admin";
import { query } from "./db";

// Banco de ideias (Sistema Editorial e Content-Led v1.0). A unidade é a
// IDEIA (§7). Cada derivação recebe um código que vira utm_content: é o que
// liga a peça publicada a visitas, Mapas, leads e receita (§27).

export const UNIVERSOS: Record<string, { nome: string; referencia: number }> = {
  eu_me_vi_aqui: { nome: "Eu me vi aqui", referencia: 30 },
  ju_pensa: { nome: "Ju pensa", referencia: 20 },
  historias: { nome: "Histórias", referencia: 15 },
  cultura: { nome: "Cultura explica a vida", referencia: 15 },
  ferramentas: { nome: "Ferramentas", referencia: 15 },
  movimento: { nome: "Movimento (oferta direta)", referencia: 5 },
};

export const ESTADOS_ICP: Record<string, string> = {
  funcional_exausto: "Funcional Exausto",
  lucido_imovel: "Lúcido Imóvel",
  bem_sucedido_desalinhado: "Bem-sucedido Desalinhado",
  decidido_com_medo: "Decidido com Medo",
  inquieto_em_expansao: "Inquieto em Expansão",
};

/** Portas principais de cada estado do ICP (ICP e Linguagem Externa §4). */
export const PORTAS_ICP: Record<string, string[]> = {
  funcional_exausto: ["energia", "felicidade", "amor"],
  lucido_imovel: ["mentalidade", "coragem", "acao"],
  bem_sucedido_desalinhado: ["autoconhecimento", "felicidade", "planejamento"],
  decidido_com_medo: ["coragem", "planejamento", "acao"],
  inquieto_em_expansao: ["inteligencia", "excelencia", "amor", "felicidade"],
};

export const GATILHOS: Record<string, string> = {
  contradicao: "Contradição",
  custo: "Custo",
  reconhecimento: "Reconhecimento",
  possibilidade: "Possibilidade",
};

export const OBJETIVOS: Record<string, string> = {
  atencao: "Capturar atenção",
  reconhecimento: "Produzir reconhecimento",
  movimento: "Produzir movimento",
};

export const NIVEIS_CTA: Record<number, string> = {
  0: "0 · nenhum (reflexão)",
  1: "1 · conversa",
  2: "2 · descoberta (Mapa)",
  3: "3 · oferta",
};

/** Derivações possíveis de uma ideia-mãe (§7). */
export const FORMATOS = [
  "Reel da Ju", "Reel cinematográfico", "Carrossel", "Post de frase", "Stories", "Artigo", "Newsletter",
  "Anúncio", "Pergunta de Mapa", "Trecho de página", "E-mail", "Script de vídeo", "Remarketing", "Gancho para Mentoria",
];

/** Territórios de aquisição iniciais (§22): ~70% do conteúdo comercial aqui. */
export const TERRITORIOS_INICIAIS = ["energia", "acao", "coragem", "autoconhecimento"];

export interface Resultado {
  visitas: number;
  mapas: number;
  leads: number;
  compras: number;
  receita: number;
}

const VAZIO: Resultado = { visitas: 0, mapas: 0, leads: 0, compras: 0, receita: 0 };

/** Resultado por código de derivação (utm_content). */
export async function resultadoPorCodigo(codigos: string[]): Promise<Record<string, Resultado>> {
  await exigirAdmin();
  if (!codigos.length) return {};
  const rows = await query<{ codigo: string; visitas: string; mapas: string; leads: string; compras: string; receita: string }>(
    `select c codigo,
            (select count(distinct lead_id) from sessions where utm_content = c) visitas,
            (select count(*) from map_results where utm_content = c) mapas,
            (select count(distinct l.lead_id) from leads l where l.email is not null
               and (l.first_touch_content = c or l.last_touch_content = c)) leads,
            (select count(*) from transactions where utm_content = c and transaction_status = 'approved') compras,
            (select coalesce(sum(amount_gross),0) from transactions where utm_content = c and transaction_status = 'approved') receita
     from unnest($1::text[]) c`,
    [codigos]
  );
  return Object.fromEntries(
    rows.map((r) => [r.codigo, { visitas: +r.visitas, mapas: +r.mapas, leads: +r.leads, compras: +r.compras, receita: +r.receita }])
  );
}

export function somar(rs: Resultado[]): Resultado {
  return rs.reduce(
    (a, r) => ({ visitas: a.visitas + r.visitas, mapas: a.mapas + r.mapas, leads: a.leads + r.leads, compras: a.compras + r.compras, receita: a.receita + r.receita }),
    { ...VAZIO }
  );
}

/** Código curto e legível para utm_content: formato + dimensão + 4 caracteres. */
export function gerarCodigo(formato: string, dimensao: string | null): string {
  const base = formato
    .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 20);
  const sufixo = Math.random().toString(36).slice(2, 6);
  return [base, dimensao, sufixo].filter(Boolean).join("_");
}

/** Link rastreável da derivação (Funis §27: source/medium/campaign/content). */
export function linkRastreavel(d: { destino: string; canal: string; pago: boolean; campanha: string | null; codigo: string }, dimensao: string | null) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://epic247.com.br").replace(/\/$/, "");
  const u = new URL(d.destino.startsWith("/") ? d.destino : `/${d.destino}`, site);
  u.searchParams.set("utm_source", d.canal);
  u.searchParams.set("utm_medium", d.pago ? "paid_social" : d.canal === "email" ? "email" : "organic");
  u.searchParams.set("utm_campaign", d.campanha || `editorial_${dimensao ?? "geral"}`);
  u.searchParams.set("utm_content", d.codigo);
  return u.toString();
}
