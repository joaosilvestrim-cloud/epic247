import "server-only";
import { estadoMentoria } from "../mentoria";
import { isDimensionId } from "../dimensions";
import { planoLiberavel } from "../plano/liberacao";
import { PRODUCTS, type Product } from "../products";
import { query } from "./db";

// Produtos vêm do banco (preço, checkout e ativação editáveis no /admin).
// Se o banco estiver fora, cai no catálogo do código, sem quebrar a página.

export async function listarProdutos(): Promise<Product[]> {
  try {
    const rows = await query<Product & { price_list: string }>(
      `select p.product_id, p.product_type, p.product_dimension, p.product_name, p.price_list, p.checkout_url,
              p.active, p.delivery,
              case p.product_type
                when 'kit' then exists (select 1 from product_assets a where a.published and a.product_type = 'kit'
                                         and a.dimension = p.product_dimension)
                when 'protocol' then (select count(distinct a.dimension) from product_assets a where a.published) >= 10
                else true end as materiais_ok
       from products p`
    );
    if (!rows.length) return PRODUCTS;
    return rows.map((r) => ({ ...r, price_list: Number(r.price_list) }));
  } catch {
    return PRODUCTS;
  }
}

export async function produto(id: string): Promise<Product | null> {
  return (await listarProdutos()).find((p) => p.product_id === id) ?? null;
}

/**
 * Só para QA automatizado fora de produção: libera Planos sem aprovação
 * editorial para testar compra e geração. Em produção é ignorado.
 */
export const PLANO_LIBERADO_PARA_QA =
  process.env.NEXT_PUBLIC_EPIC_ENV !== "production" &&
  process.env.VERCEL_ENV !== "production" &&
  process.env.EPIC_PLANO_SEM_APROVACAO === "1";

/** Plano da dimensão pode ser vendido (conteúdo aprovado, ou QA fora de produção). */
export function planoVendavel(d: string): boolean {
  return PLANO_LIBERADO_PARA_QA || (isDimensionId(d) && planoLiberavel(d));
}

/**
 * Vendável = ativo, com checkout configurado (RF-073), no Plano com o conteúdo
 * da dimensão completo e aprovado (auditoria NC-07) e, no Kit e no Protocolo,
 * com materiais publicados no Meu EPIC (CR-01).
 */
export const vendavel = (p: Product | null | undefined): p is Product =>
  Boolean(
    p &&
      p.active &&
      p.checkout_url &&
      (p.product_type !== "plan" || planoVendavel(p.product_dimension ?? "")) &&
      entregavel(p)
  );

/**
 * CR-01: Kit e Protocolo só são vendidos quando o Meu EPIC tem o que entregar
 * (materiais publicados), salvo o produto ainda entregue pela Kiwify. Sem a
 * informação (banco fora, catálogo do código), não bloqueia.
 */
export function entregavel(p: Product): boolean {
  if (p.product_type !== "kit" && p.product_type !== "protocol") return true;
  if (p.delivery === "kiwify" || p.materiais_ok === undefined) return true;
  return p.materiais_ok === true;
}

/**
 * Capacidade da Mentoria (RF-035): conta clientes ATIVOS. Ativo = candidatura
 * em "ativo", ou compra aprovada de quem ainda não concluiu o ciclo (cobre
 * compras anteriores ao fluxo de candidatura). Concluir libera a vaga.
 * "reservadas" = vaga confirmada ou link enviado, ainda sem pagamento: não
 * fecha a página, mas a equipe vê antes de liberar outro link.
 */
export async function capacidadeMentoria(): Promise<{
  capacidade: number; ocupadas: number; reservadas: number; disponivel: boolean;
}> {
  try {
    const [cfg] = await query<{ value: number }>("select value from app_settings where key = 'mentoring_capacity'");
    const capacidade = Number(cfg?.value ?? 5);
    const [r] = await query<{ ocupadas: string; reservadas: string }>(
      `select
         (select count(*) from (
            select lead_id from mentoring_applications where status = 'ativo' and lead_id is not null
            union
            select t.lead_id from transactions t join products p using (product_id)
            where p.product_type = 'mentoring' and t.transaction_status = 'approved' and t.lead_id is not null
              and not exists (select 1 from mentoring_applications a
                              where a.lead_id = t.lead_id and a.status = 'concluido')
          ) x)::text as ocupadas,
         (select count(*) from mentoring_applications
          where status in ('vaga_confirmada','link_enviado'))::text as reservadas`
    );
    const ocupadas = Number(r?.ocupadas ?? 0);
    return { capacidade, ocupadas, reservadas: Number(r?.reservadas ?? 0), disponivel: estadoMentoria(capacidade, ocupadas) === "AVAILABLE" };
  } catch {
    return { capacidade: 5, ocupadas: 0, reservadas: 0, disponivel: true };
  }
}
