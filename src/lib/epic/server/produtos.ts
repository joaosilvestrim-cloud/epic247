import "server-only";
import { estadoMentoria } from "../mentoria";
import { PRODUCTS, type Product } from "../products";
import { query } from "./db";

// Produtos vêm do banco (preço, checkout e ativação editáveis no /admin).
// Se o banco estiver fora, cai no catálogo do código, sem quebrar a página.

export async function listarProdutos(): Promise<Product[]> {
  try {
    const rows = await query<Product & { price_list: string }>(
      `select product_id, product_type, product_dimension, product_name, price_list, checkout_url, active
       from products`
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

/** Vendável = ativo e com checkout configurado (RF-073). */
export const vendavel = (p: Product | null | undefined): p is Product =>
  Boolean(p && p.active && p.checkout_url);

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
